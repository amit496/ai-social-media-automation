export const logger = {
  info: (message: string): void => {
    // eslint-disable-next-line no-console
    console.info(`[INFO] ${new Date().toISOString()} - ${message}`);
  },
  warn: (message: string): void => {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  },
  error: (message: string): void => {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
  },
};
