// // to do

// // src/index.ts
// /**
//  * Tinny Backend - A lightweight Node.js HTTP server framework
//  * @packageDocumentation
//  */

// // ============ Core Exports ============
// export { default as Server } from './core/Server';
// export { default as TinnyServer } from './core/Server'; // Alias for convenience

// // ============ Type Exports ============
// export type {
//     // Core types
//     ServerOptions,
//     ServerReq,
//     ServerRes,
//     AddOption,
//     HandlerFun,
//     Methods,
//     Headers,
//     Cookie,
//     Logs,
//     Session,
//     AdminSessions,
//     Decorator,
//     DirFiles,
//     ServFiles
// } from './core/types';

// // ============ Core Components ============
// export { RequestParser } from './core/RequestParser';
// export { ResponseBuilder } from './core/ResponseBuilder';
// export { RouteMatcher } from './core/RouteMatcher';

// // ============ Utilities ============
// export { Logger, getDefaultLogger, log } from './utils/Logger';
// export type { LoggerOptions, LogLevel } from './utils/Logger';
// export { SessionManager } from './utils/SessionManager';
// export { CookieManager } from './utils/CookieManager';
// export { FileHandler } from './utils/FileHandler';
// export { colors } from './utils/Logger';

// // ============ Middleware ============
// export { 
//     authMiddleware,
//     rateLimiter,
//     requestLogger,
//     corsMiddleware,
//     bodyParser,
//     compressMiddleware
// } from './middleware';

// export type {
//     AuthOptions,
//     RateLimitOptions,
//     CorsOptions,
//     BodyParserOptions
// } from './middleware';

// // ============ Admin Module ============
// export { AdminMonitor } from './admin/monitor';
// export type { AdminOptions } from './admin/monitor';

// // ============ Decorators ============
// export { DecoratorManager } from './decorators';

// // ============ Constants ============
// export const VERSION = '1.0.0';
// export const NAME = 'tinny-backend';

// // ============ Default Export ============
// import Server from './core/Server';
// export default Server;

// // ============ Convenience Exports ============
// // For users who want to import like: import { createServer } from 'tinny-backend'
// export function createServer(options?: import('./core/types').ServerOptions): Server {
//     return new Server(options || {});
// }

// // ============ Error Classes ============
// export class TinnyError extends Error {
//     constructor(
//         message: string,
//         public statusCode: number = 500,
//         public code?: string
//     ) {
//         super(message);
//         this.name = 'TinnyError';
//     }
// }

// export class NotFoundError extends TinnyError {
//     constructor(message: string = 'Resource not found') {
//         super(message, 404, 'NOT_FOUND');
//         this.name = 'NotFoundError';
//     }
// }

// export class ValidationError extends TinnyError {
//     constructor(message: string = 'Validation failed') {
//         super(message, 400, 'VALIDATION_ERROR');
//         this.name = 'ValidationError';
//     }
// }

// export class UnauthorizedError extends TinnyError {
//     constructor(message: string = 'Unauthorized') {
//         super(message, 401, 'UNAUTHORIZED');
//         this.name = 'UnauthorizedError';
//     }
// }

// // ============ Helper Functions ============

// /**
//  * Check if running in development mode
//  */
// export function isDev(): boolean {
//     return process.env.NODE_ENV === 'development';
// }

// /**
//  * Check if running in production mode
//  */
// export function isProd(): boolean {
//     return process.env.NODE_ENV === 'production';
// }

// /**
//  * Get the current environment
//  */
// export function getEnv(): string {
//     return process.env.NODE_ENV || 'development';
// }

// /**
//  * Create a path from parts
//  */
// export function joinPath(...parts: string[]): string {
//     return parts.join('/').replace(/\/+/g, '/');
// }

// // ============ Type Guards ============

// /**
//  * Type guard for ServerReq
//  */
// export function isServerReq(obj: any): obj is import('./core/types').ServerReq {
//     return obj && typeof obj === 'object' && 'ip' in obj && 'ReqUrl' in obj;
// }

// /**
//  * Type guard for ServerRes
//  */
// export function isServerRes(obj: any): obj is import('./core/types').ServerRes {
//     return obj && typeof obj === 'object' && 'send' in obj && 'sendFile' in obj;
// }

// // ============ Package Information ============
// export const packageInfo = {
//     name: NAME,
//     version: VERSION,
//     description: 'A lightweight Node.js HTTP server framework',
//     homepage: 'https://github.com/yourusername/tinny-backend',
//     bugs: 'https://github.com/yourusername/tinny-backend/issues'
// };