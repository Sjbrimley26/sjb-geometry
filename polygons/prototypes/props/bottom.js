import { sort, head } from "sjb-utils/Arrays.js";
import { compose } from "sjb-utils/Functions.js";

const bottom = {
  bottom: {
    get: function () {
      return compose(
        p => p.y,
        head,
        sort((a, b) => b.y - a.y)
      )(this.vertices)
    }
  }
};

export default bottom;


