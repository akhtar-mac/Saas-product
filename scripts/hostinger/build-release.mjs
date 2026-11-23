#!/usr/bin/env node
/**
 * Hostinger release build (dnyanvedh.com / api.dnyanvedh.com).
 *
 *   node scripts/hostinger/build-release.mjs --api-url https://api.dnyanvedh.com \
 *        --site-url https://dnyanvedh.com [--out release]
 *
 * Produces, without touching any server:
 *   <out>/web/             static Vite build + SPA/HTTPS .htaccess   -> website public_html
 *   <out>/api/             self-contained Node app (dist/index.js bundle, package.json,
 *                          package-lock.json, prisma/schema.prisma) -> Hostinger Node.js app
 *                          (app type express, entry dist/index.js, build script "build"
 *                          = prisma generate)
 *   <out>/api-<sha>.tar.gz archive of <out>/api for the Hostinger archive build
 *
 * Why the bundle: @etaxwala/types is a workspace package (TypeScript source), so the API
 * is bundled with esbuild and only real npm packages stay external. `bcrypt` is aliased to
 * the pure-JS `bcryptjs` (same API, same $2a/$2b hashes) so no native build is needed on
 * shared hosting. No secrets are read or written; production env lives on the server.
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const apiUrl = arg('api-url');
const siteUrl = arg('site-url');
if (!apiUrl || !siteUrl) {
  console.error('Usage: build-release.mjs --api-url https://api.example.com --site-url https://example.com');
  process.exit(1);
}
const out = path.resolve(root, arg('out', 'release'));
const siteHost = new URL(siteUrl).host;
const sha = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root }).toString().trim();
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: 'inherit', ...opts });

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// ── Web ──────────────────────────────────────────────────────────────────────
const webDir = path.join(root, 'apps/web');
const webOut = path.join(out, 'web');
run(path.join(webDir, 'node_modules/.bin/vite'), ['build', '--outDir', webOut, '--emptyOutDir'], {
  cwd: webDir,
  env: {
    ...process.env,
    VITE_API_URL: apiUrl,
    VITE_SOCKET_URL: apiUrl,
    VITE_SITE_URL: siteUrl,
    VITE_GA_MEASUREMENT_ID: '',
    VITE_RAZORPAY_KEY_ID: '',
  },
});
const hostRe = siteHost.replace(/\./g, '\\.');
fs.writeFileSync(
  path.join(webOut, '.htaccess'),
  `Options -MultiViews -Indexes
RewriteEngine On

# Force HTTPS and the bare domain
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} ^www\\.${hostRe}$ [NC]
RewriteRule ^ https://${siteHost}%{REQUEST_URI} [L,R=301]

# SPA fallback: serve index.html for any path that is not a real file or folder
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]

<IfModule mod_headers.c>
  <FilesMatch "index\\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
</IfModule>
`
);

// ── API ──────────────────────────────────────────────────────────────────────
const apiDir = path.join(root, 'apps/api');
const apiOut = path.join(out, 'api');
fs.mkdirSync(path.join(apiOut, 'prisma'), { recursive: true });
const apiPkg = JSON.parse(fs.readFileSync(path.join(apiDir, 'package.json'), 'utf8'));
const external = Object.keys(apiPkg.dependencies).filter(
  (d) => !d.startsWith('@etaxwala/') && d !== 'bcrypt'
);
// esbuild ships with Vite; resolve it from the web app so no new dependency is needed.
const requireFromVite = createRequire(createRequire(path.join(webDir, 'package.json')).resolve('vite'));
const esbuild = requireFromVite('esbuild');
await esbuild.build({
  entryPoints: [path.join(apiDir, 'src/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  tsconfig: path.join(apiDir, 'tsconfig.json'),
  external: [...external, 'bcryptjs'],
  alias: { bcrypt: 'bcryptjs' },
  outfile: path.join(apiOut, 'dist/index.js'),
  banner: { js: "import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);" },
  logLevel: 'info',
});
fs.copyFileSync(path.join(apiDir, 'prisma/schema.prisma'), path.join(apiOut, 'prisma/schema.prisma'));

const installed = (name) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(apiDir, 'node_modules', name, 'package.json'), 'utf8')).version;
  } catch {
    return apiPkg.dependencies[name] || apiPkg.devDependencies?.[name];
  }
};
const deps = {};
for (const d of external.filter((d) => !d.startsWith('@types/'))) deps[d] = installed(d);
deps.bcryptjs = '2.4.3';
deps.prisma = installed('prisma');
fs.writeFileSync(
  path.join(apiOut, 'package.json'),
  JSON.stringify(
    {
      name: 'etaxwala-api',
      version: apiPkg.version,
      private: true,
      type: 'module',
      main: 'dist/index.js',
      engines: { node: '>=20' },
      scripts: { build: 'prisma generate', start: 'node dist/index.js' },
      dependencies: deps,
    },
    null,
    2
  ) + '\n'
);
run('npm', ['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: apiOut });
run('tar', ['czf', path.join(out, `api-${sha}.tar.gz`), 'package.json', 'package-lock.json', 'dist', 'prisma'], {
  cwd: apiOut,
});
console.log(`\nRelease ${sha} ready in ${path.relative(root, out)}/ (web/, api/, api-${sha}.tar.gz)`);
