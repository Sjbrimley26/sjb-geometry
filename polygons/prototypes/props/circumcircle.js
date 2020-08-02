import Circle from "../../Circle.js";
import { divide, sin, toRadians } from "sjb-utils/Math.js";

// use with regular polygons only
const circumcircle = {
  circumcircle: {
    get: function() {
      const { center, sideLength, sides } = this;
      return Circle.of({
        center,
        radius: divide(sideLength)(2 * sin(toRadians(180 / sides)))
      });
    }
  }
};

export default circumcircle;
