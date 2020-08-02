import { Vector } from "sjb-physics";
import { sqrt, pow, toFixedFloat, atan } from "sjb-utils/Math.js";

/**
 * A 2d point in space.
 * @param {number} x 
 * @param {number} y 
 */
function point(x, y) {
  this.x = x;
  this.y = y;
}

/**
 * Returns a vector from (0, 0) to the given point.
 */
point.prototype.toVector = function() {
  const { x, y } = this;
  const magnitude = sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  const direction = atan(y/x);
  return Vector.of(direction, magnitude);
}

/**
 * Returns a new point offset by a given vector.
 * @param {Vector} vector
 */
point.prototype.addVector = function(vector) {
  // returns a new Point
  const { x, y } = vector;
  return Point(x + this.x, y + this.y);
}

point.prototype[Symbol.iterator] = function*() {
  yield this.x;
  yield this.y;
}

/**
 * A 2d point in space.
 * @param {number} x 
 * @param {number} y
 * @returns {point}
 */
const Point = function(x, y) {
  return new point(x, y);
}

/**
 * Find the geo-spatial relation between 3 points.
 * @static
 * @param {point} p1 Point 1.
 * @param {point} p2 Point 2.
 * @param {point} p3 Point 3.
 * @returns 0 = colinear, 1 = clockwise, 2 = counter-clockwise.
 */
Point.orientation = (p1, p2, p3) => {
  // https://www.geeksforgeeks.org/orientation-3-ordered-points/
  // 0 == colinear
  // 1 == clockwise
  // 2 == counter-clockwise
  const val = (p2.y - p1.y) * (p3.x - p2.x) -
    (p2.x - p1.x) * (p3.y - p2.y);

  if (val == 0) return 0; // colinear 

  return (val > 0) ? 1 : 2; // clock or counter-clockwise 
}

export default Point;