import winston from 'winston';
import { env } from '../config/env.js';

const { combine, timestamp, colorize, printf, json, errors } = winston.format;

// ─── Custom console format ────────────────────────────────────────────────────
const consoleFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const base = `${ts} [${level}] ${message}`;
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return stack ? `${base}\n${stack}${metaStr}` : `${base}${metaStr}`;
});

// ─── Logger instance ──────────────────────────────────────────────────────────
export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  defaultMeta: { service: 'etaxwala-api' },
  transports: [
    // Console transport — always on
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'HH:mm:ss' }),
        errors({ stack: true }),
        consoleFormat
      ),
      silent: env.NODE_ENV === 'test',
    }),

    // File transports — only in production
    ...(env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: combine(timestamp(), errors({ stack: true }), json()),
            maxsize: 10 * 1024 * 1024, // 10 MB
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            format: combine(timestamp(), errors({ stack: true }), json()),
            maxsize: 20 * 1024 * 1024, // 20 MB
            maxFiles: 10,
          }),
        ]
      : []),
  ],
  exceptionHandlers: [
    new winston.transports.Console({ format: combine(colorize(), timestamp(), consoleFormat) }),
  ],
  rejectionHandlers: [
    new winston.transports.Console({ format: combine(colorize(), timestamp(), consoleFormat) }),
  ],
});

// ─── Morgan-compatible stream for HTTP request logging ────────────────────────
export const morganStream = {
  write: (message: string) => logger.http(message.trim()),
};

export default logger;
