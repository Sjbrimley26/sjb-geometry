import { get } from "sjb-utils/Objects.js";

const midpoints = {
  midpoints: {
    get: function () {
      return this.edges.map(get("center"));
    }
  }
};

export default midpoints;
