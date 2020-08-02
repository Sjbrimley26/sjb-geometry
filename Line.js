import Point from "./Point.js";
import { 
  divide,
  multiply,
  subtract,
  sqrt,
  pow,
  toFixedFloat,
  cos,
  sin,
  slopeToDegrees
} from "sjb-utils/Math.js";
import { Vector } from "sjb-physics";

/**
 * A straight line between 2 points.
 * @param {Point} start 
 * @param {Point} end 
 */
function line(start, end) {
  this.start = start;
  this.end = end;
}

/**
 * Returns true if the provided point rests on the line.
 * @param {Point} point
 */
line.prototype.isPointOnLine = function(point) {
  const { x, y } = this.start;
  return multiply(point.x - x)(this.slope) === subtract(point.y)(y);
}

/**
 * Returns true if the provided line interesects with this line.
 * @param {line} line2
 */
line.prototype.intersectsWith = function(line2) {
  // https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/
  const { start: p1, end: q1 } = this;
  const { start: p2, end: q2 } = line2;
  const o1 = Point.orientation(p1, q1, p2);
  const o2 = Point.orientation(p1, q1, q2);
  const o3 = Point.orientation(p2, q2, p1);
  const o4 = Point.orientation(p2, q2, q1);
  
  // General case
  if (o1 != o2 && o3 != o4) return true;
  
  // Special Cases 
  // p1, q1 and p2 are colinear and p2 lies on segment p1q1 
  if (o1 == 0 && this.isPointOnLine(p2)) return true;
  // p1, q1 and q2 are colinear and q2 lies on segment p1q1 
  if (o2 == 0 && this.isPointOnLine(q2)) return true;
  // p2, q2 and p1 are colinear and p1 lies on segment p2q2 
  if (o3 == 0 && line2.isPointOnLine(p1)) return true;
  // p2, q2 and q1 are colinear and q1 lies on segment p2q2 
  if (o4 == 0 && line2.isPointOnLine(q1)) return true;
  return false; // Doesn't fall in any of the above cases
}

/**
 * @param {line} line2
 * @returns {?Point} Returns the point of interections between the two lines, or undefined if they do not intersect or are overlapping.
 */
line.prototype.getPointOfIntersection = function(line2) {
  if (
    !this.intersectsWith(line2) ||
    this.slope == line2.slope
  ) {
    return undefined;
  }
  
  const { start, slope: m0 } = this;
  const { x: x0, y: y0 } = start;
  const { start: s1, slope: m1 } = line2;
  const { x: x1, y: y1 } = s1;

  const x = toFixedFloat((m0 * x0 - m1 * x1 + y1 - y0) / (m0 - m1), 2);
  const y = toFixedFloat((m0 * m1 * (x1 - x0) + m1 * y0 - m0 * y1) / (m1 - m0), 2);

  return Point(x, y);
}

/**
 * Returns a new line which runs perpendicular to this one and passes through the center of it, with equal length.
 */
line.prototype.getPerpendicular = function() {
  const { slope, length, center } = this;
  const { x, y } = center;
  let inv = -1 * divide(1)(slope);
  let x0, x1, y0, y1, b;

  if (isNaN(inv)) {
    x0 = -1000;
    x1 = 1000;
    y0 = y;
    y1 = y;
  } else if (!isFinite(inv)) {
    x0 = x;
    x1 = x;
    y0 = -1000;
    y1 = 1000;
  } else {
    x0 = -1000;
    x1 = 1000;
    b = subtract(y)(inv * x);
    y0 = x0 * inv + b;
    y1 = x1 * inv + b;
  }

  return Line(Point(x0, y0), Point(x1, y1));
}

line.prototype.toVector = function() {
  const { slope, length } = this;
  let direction = slopeToDegrees(slope);
  direction = isNaN(direction) ? 0 : direction;
  const magnitude = length;
  return Vector.of(direction, magnitude);
}

/**
 * Moves the line to the end of the vector.
 */
line.prototype.addVector = function(vec) {
  this.start = this.start.addVector(vec);
  this.end = this.end.addVector(vec);
}

Object.defineProperties(line.prototype, {
  slope: {
    get: function() {
      if (this.start.x == this.end.x) return undefined;
      return divide(this.end.y - this.start.y)(this.end.x - this.start.x);
    }
  },

  length: {
    get: function() {
      return sqrt(
        pow(this.end.x - this.start.x)(2) + 
        pow(this.end.y - this.start.y)(2)
      );
    },
    set: function(len) {
      const { x, y } = this.start;
      const dx = this.end.x - x > 0 ? 1 : -1;
      const dy = this.end.y - y > 0 ? 1 : -1;
      const angle = toFixedFloat(Math.atan(this.slope), 2);
      this.end = Point(
        dx * toFixedFloat(len * sin(angle) - x, 2),
        dy * toFixedFloat(len * cos(angle) - y, 2)
      );
      return true;
    }
  },
  
  distance: {
    get: function() { return this.length; },
    set: function(d) {
      this.length = d;
      return true;
    }
  },

  center: {
    get: function() {
      return Point(
        divide(this.end.x + this.start.x)(2),
        divide(this.end.y + this.start.y)(2)
      );
    }
  },

  yInt: {
    get: function() {
      if (this.start.x == this.end.x) {
        return this.start.y == 0 ? 0 : false;
      }
      if (this.start.y == this.end.y) {
        return this.start.y;
      }
      return subtract(this.start.y)(this.slope * this.start.x);
    }
  },

  xInt: {
    get: function() {
      if (this.start.y == this.end.y) {
        return this.start.x == 0 ? 0: false;
      }
      if (this.start.x == this.end.x) {
        return this.start.x;
      }
      return divide(-1 * (this.slope * this.start.x - this.start.y))(this.slope);
    }
  }
});

/**
 * A straight line between 2 points.
 * @param {Point} p1
 * @param {Point} p2
 */
const Line = (p1, p2) => new line(p1, p2)

export default Line;
