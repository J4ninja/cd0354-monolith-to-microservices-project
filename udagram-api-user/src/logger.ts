const SERVICE = 'backend-user';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: SERVICE,
    message,
    ...meta,
  };
  const output = JSON.stringify(entry);
  if (level === 'ERROR') {
    console.error(output);
  } else if (level === 'WARN') {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  info:  (message: string, meta?: Record<string, unknown>) => log('INFO',  message, meta),
  warn:  (message: string, meta?: Record<string, unknown>) => log('WARN',  message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('ERROR', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => log('DEBUG', message, meta),
};
