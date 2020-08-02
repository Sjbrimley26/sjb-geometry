import { divide, tan, toRadians } from "sjb-utils/Math.js";

// use with regular polygons only
const apothem = {
  apothem: {
    get: function() {
      const { sideLength, sides } = this;
      return Math.abs(
        divide(sideLength)(2 * tan(toRadians(180 / sides)))
      );
    }
  }
};

export default apothem;
