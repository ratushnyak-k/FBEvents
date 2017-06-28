export default helpers = {
  customizer: (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
      return srcValue;
    }
  },
};