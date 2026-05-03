// Temporary logger utility to catch frontend errors for debugging
const LOG_KEY = 'lumina_debug_logs';

export const initLogger = () => {
  const originalError = console.error;
  const originalWarn = console.warn;

  const log = (type, args) => {
    const existing = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    const newEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')
    };
    // Keep only last 50 logs
    const updated = [newEntry, ...existing].slice(0, 50);
    localStorage.setItem(LOG_KEY, JSON.stringify(updated));
  };

  console.error = (...args) => {
    log('ERROR', args);
    originalError.apply(console, args);
  };

  console.warn = (...args) => {
    log('WARN', args);
    originalWarn.apply(console, args);
  };
};

export const getLogs = () => JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
export const clearLogs = () => localStorage.removeItem(LOG_KEY);
