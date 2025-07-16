// Define los tipos de logs disponibles
type LogType = 'log' | 'info' | 'warn' | 'error' | 'debug';

// Verifica si el modo es desarrollo
const isDevelopment = import.meta.env.MODE === 'development';

// Función para imprimir logs
const print = (level: LogType, ...args: any[]) => {
  // Solo muestra logs en modo desarrollo o si es un error
  if (isDevelopment || level === 'error') {
    console[level](`[${level.toUpperCase()}]`, ...args);
  }
};

// Exporta el logger
export const logger = {
  log   : (...args: any[]) => print('log', ...args),
  info  : (...args: any[]) => print('info', ...args),
  warn  : (...args: any[]) => print('warn', ...args),
  error : (...args: any[]) => print('error', ...args),
  debug : (...args: any[]) => print('debug', ...args),
};