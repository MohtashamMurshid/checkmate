import { config, isDevelopment } from "./config";

export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

interface LogContext {
  requestId?: string;
  userId?: string;
  platform?: string;
  operation?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private formatLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: isDevelopment ? error.stack : undefined,
      };
    }

    return logEntry;
  }

  private output(logEntry: LogEntry) {
    if (isDevelopment) {
      // Pretty console output for development
      const { level, message, context, error } = logEntry;
      const colorMap = {
        [LogLevel.ERROR]: "\x1b[31m", // Red
        [LogLevel.WARN]: "\x1b[33m", // Yellow
        [LogLevel.INFO]: "\x1b[36m", // Cyan
        [LogLevel.DEBUG]: "\x1b[90m", // Gray
      };

      const reset = "\x1b[0m";
      const color = colorMap[level];

      console.log(`${color}[${level.toUpperCase()}]${reset} ${message}`);
      if (context && Object.keys(context).length > 0) {
        console.log("  Context:", JSON.stringify(context, null, 2));
      }
      if (error) {
        console.log("  Error:", error);
      }
    } else {
      // Structured JSON output for production
      console.log(JSON.stringify(logEntry));
    }
  }

  error(message: string, context?: LogContext, error?: Error) {
    this.output(this.formatLog(LogLevel.ERROR, message, context, error));
  }

  warn(message: string, context?: LogContext) {
    this.output(this.formatLog(LogLevel.WARN, message, context));
  }

  info(message: string, context?: LogContext) {
    this.output(this.formatLog(LogLevel.INFO, message, context));
  }

  debug(message: string, context?: LogContext) {
    if (config.ENABLE_DETAILED_LOGGING || isDevelopment) {
      this.output(this.formatLog(LogLevel.DEBUG, message, context));
    }
  }

  // Performance logging
  async measure<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Omit<LogContext, "operation" | "duration">
  ): Promise<T> {
    const startTime = Date.now();
    const operationContext = { ...context, operation };

    this.debug(`Starting ${operation}`, operationContext);

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      this.info(`Completed ${operation}`, {
        ...operationContext,
        duration,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.error(
        `Failed ${operation}`,
        {
          ...operationContext,
          duration,
        },
        error as Error
      );

      throw error;
    }
  }
}

export const logger = new Logger();

// Request context helper
export function createRequestLogger(requestId: string, userId?: string) {
  return {
    error: (
      message: string,
      context?: Omit<LogContext, "requestId" | "userId">,
      error?: Error
    ) => logger.error(message, { ...context, requestId, userId }, error),
    warn: (
      message: string,
      context?: Omit<LogContext, "requestId" | "userId">
    ) => logger.warn(message, { ...context, requestId, userId }),
    info: (
      message: string,
      context?: Omit<LogContext, "requestId" | "userId">
    ) => logger.info(message, { ...context, requestId, userId }),
    debug: (
      message: string,
      context?: Omit<LogContext, "requestId" | "userId">
    ) => logger.debug(message, { ...context, requestId, userId }),
    measure: <T>(
      operation: string,
      fn: () => Promise<T>,
      context?: Omit<
        LogContext,
        "requestId" | "userId" | "operation" | "duration"
      >
    ) => logger.measure(operation, fn, { ...context, requestId, userId }),
  };
}
