import { toRadians } from "sjb-utils/Math.js";
import { range } from "sjb-utils/Arrays.js"

// use with regular polygons only
const vertices = {
  vertices: {
    get: function() {
      const { sides, rotation } = this;
      const a = 36000 / (sides * 100)
      const start = ((a * 100 / 200) * 100 - rotation * 100) / 100;
      
      return range(start, 360 + start, a, toRadians)
        .map(angle => this.circumcircle.getPointOnCircle(angle));
    }
  }
};

export default vertices;
