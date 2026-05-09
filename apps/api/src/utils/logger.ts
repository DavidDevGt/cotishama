/**
 * Console logging infrastructure for the API
 * Follows Constitution guidelines: console logging only
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  operation?: string;
  endpoint?: string;
  [key: string]: unknown;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}]${contextStr} ${message}`;
  }

  debug(message: string, context?: LogContext): void {
    console.debug(this.formatMessage('debug', message, context));
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage('error', message, context));
  }

  logOperation(operation: string, details?: Record<string, unknown>): void {
    this.info(`Operation: ${operation}`, details as LogContext);
  }
}

export const logger = new Logger();