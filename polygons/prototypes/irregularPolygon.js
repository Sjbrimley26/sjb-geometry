import Polygon from "./Polygon.js";
import {
  perimeter,
  irregularApothem,
  inscribedCircle
} from "./props/index.js"

function IrregularPolygon({ center, sides }) {
  Polygon.call(this, { center, sides });
}

IrregularPolygon.prototype = Object.create(Polygon.prototype);

Object.defineProperties(IrregularPolygon.prototype, {
  ...perimeter,
  ...inscribedCircle,
  ...irregularApothem
});

export default IrregularPolygon;