const {REACT_APP_BUILD_MODE} = process.env;

class Logger {
  static log(...args) {
    if (REACT_APP_BUILD_MODE !== 'production') {
      console.log(...args);
    }
    return;
  };

  static info(...args) {
    if (REACT_APP_BUILD_MODE !== 'production') {
      console.info(...args);
    }
    return;
  };

  static warn(...args) {
    if (REACT_APP_BUILD_MODE !== 'production') {
      console.warn(...args);
    }
    return;
  };

  static error(...args) {
    if (REACT_APP_BUILD_MODE !== 'production') {
      console.error(...args);
    }
    return;
  };
}


export default Logger;