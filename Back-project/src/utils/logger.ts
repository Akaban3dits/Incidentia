const isTest = process.env.NODE_ENV === "test";

const logger = {
  info: (...args: any[]) => {
    if (!isTest) console.log(...args);
  },
  warn: (...args: any[]) => {
    if (!isTest) console.warn(...args);
  },
  error: (...args: any[]) => {
    console.error(...args);
  },
  debug: (...args: any[]) => {
    if (!isTest && process.env.DEBUG) console.debug(...args);
  },
};

export default logger;
