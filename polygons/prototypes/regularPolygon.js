import Polygon from "./Polygon.js";
import {
  area,
  circumcircle,
  inscribedCircle,
  regularApothem,
  vertices,
  bottom,
  regularPerimeter,
  triangles
} from "./props/index.js";

function RegularPolygon({ center, sides, sideLength }) {
  Polygon.call(this, { center, sides });
  this.sideLength = sideLength;
}

RegularPolygon.prototype = Object.create(Polygon.prototype);

Object.defineProperties(RegularPolygon.prototype, {
  ...area,
  ...regularPerimeter,
  ...circumcircle,
  ...inscribedCircle,
  ...regularApothem,
  ...vertices,
  ...bottom,
  ...triangles,
});

export default RegularPolygon;
