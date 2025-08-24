import { type Logger, type LoggerOptions } from 'pino';

export enum ServerEnvironment {
    DEV,
    PREV,
    STG,
    PROD 
}

export type PinoLogger = Logger & {
    setLogLevel?: (NODE_ENV: ServerEnvironment) => LoggerOptions['level'];
};

//note: logging types
// logger.info('Your custom message here', someData);
// logger.debug({ error: err }, 'Error occcured in the process.');
// logger.error('Error');
// logger.warn({ someData }, 'Warn user about something!');