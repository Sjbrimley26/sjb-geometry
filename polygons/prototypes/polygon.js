import edges from "./props/edges.js";
import irregularApothem from "./props/irregularApothem.js";
import midpoints from "./props/midpoints.js";
import normals from "./props/normals.js";

function Polygon({ center, sides }) {
  this.center = center;
  this.sides = sides;
  this.rotation = 0;
}

Object.defineProperties(Polygon.prototype, {
  ...edges,
  ...irregularApothem,
  ...midpoints,
  ...normals
});

export default Polygon;
