import { min } from "sjb-utils/Math.js";
import { get } from "sjb-utils/Objects.js";
import Line from "../../../Line.js";

const irregularApothem = {
  apothem: {
    get: function() {
      const { edges, center } = this;
      return min(
        edges.map(get("center")).map(p => Line(center, p).length)
      );
    }
  }
};

export default irregularApothem;
