import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerService implements LoggerService {
  private context?: string;
  private logDirectory: string;
  private logLevel: string;
  private logLevels = {
    error: 0,
    warn: 1,
    log: 2,
    debug: 3,
    verbose: 4,
  };

  constructor(private configService: ConfigService) {
    this.logDirectory = this.configService.get('logging.directory', 'logs');
    this.logLevel = this.configService.get('logging.level', 'info');
    
    // Create log directory if it doesn't exist
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  setContext(context: string) {
    this.context = context;
    return this;
  }

  error(message: any, trace?: string, context?: string) {
    this.writeLog('error', message, trace, context || this.context);
    console.error(`[${context || this.context}] ${message}`, trace);
  }

  warn(message: any, context?: string) {
    if (this.isLevelEnabled('warn')) {
      this.writeLog('warn', message, null, context || this.context);
      console.warn(`[${context || this.context}] ${message}`);
    }
  }

  log(message: any, context?: string) {
    if (this.isLevelEnabled('log')) {
      this.writeLog('log', message, null, context || this.context);
      console.log(`[${context || this.context}] ${message}`);
    }
  }

  debug(message: any, context?: string) {
    if (this.isLevelEnabled('debug')) {
      this.writeLog('debug', message, null, context || this.context);
      console.debug(`[${context || this.context}] ${message}`);
    }
  }

  verbose(message: any, context?: string) {
    if (this.isLevelEnabled('verbose')) {
      this.writeLog('verbose', message, null, context || this.context);
      console.log(`[${context || this.context}] ${message}`);
    }
  }

  private isLevelEnabled(level: string): boolean {
    return this.logLevels[level] <= this.logLevels[this.logLevel];
  }

  private writeLog(level: string, message: any, trace?: string, context?: string) {
    const date = new Date();
    const formattedDate = date.toISOString();
    const logFileName = path.join(this.logDirectory, `${date.toISOString().split('T')[0]}.log`);
    
    let logMessage = `${formattedDate} [${level.toUpperCase()}] `;
    if (context) {
      logMessage += `[${context}] `;
    }
    
    logMessage += typeof message === 'object' ? JSON.stringify(message) : message;
    
    if (trace) {
      logMessage += `\n${trace}`;
    }
    
    logMessage += '\n';
    
    fs.appendFileSync(logFileName, logMessage);
  }
}
