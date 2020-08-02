import { sum } from "sjb-utils/Math.js";
import { get } from "sjb-utils/Objects.js";

const perimeter = {
  perimeter: {
    get: function() {
      return sum(this.edges.map(get("length")));
    }
  }
};

export default perimeter;
