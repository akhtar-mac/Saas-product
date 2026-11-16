module.exports = {
  apps: [
    {
      name: 'etaxwala-api',
      script: './apps/api/dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
      },
      max_memory_restart: '1G',
      autorestart: true,
      watch: false,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
    },
  ],
};

