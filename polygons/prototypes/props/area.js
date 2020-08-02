import { divide } from "sjb-utils/Math.js";

// use with regular polygons only
const area = {
  area: {
    get: function() {
      const { perimeter, apothem } = this;
      return divide(perimeter * apothem)(2);
    }
  }
};

export default area;
