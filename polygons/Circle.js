const { PI: pi, sin, cos, pow } = Math;
import Point from "../Point.js";
import Line from "../Line.js";
import { 
  multiply,
  toFixedFloat,
  divide,
  sqrt,
  toRadians
} from "sjb-utils/Math.js";
import Polygon from "./prototypes/Polygon.js";

function Circle({center, radius}) {
  Polygon.call(this, { center, sides: 360 });
  this.radius = radius;
}

// Instance methods

Circle.prototype = Object.create(Polygon.prototype);

/**
 * 
 * @param {number} angle degrees
 * @returns {Point} the point on the circumference of the circle at the given angle
 */
Circle.prototype.getPointOnCircle = function (angle) {
  const { x, y } = this.center;
  return Point(
    toFixedFloat(this.radius * Math.sin(angle) + x, 2),
    toFixedFloat(this.radius * Math.cos(angle) + y, 2)
  );
}

/**
 * 
 * @param {Circle} circle the circle to check against
 * @returns {Point[]?} the points at which the circles intersect or undefined.
 */
Circle.prototype.getPointsOfIntersection = function (circle) {
  const { center, radius: r0 } = this;
  const { x: x0, y: y0 } = center;
  const { center: c1, radius: r1 } = circle;
  const { x: x1, y: y1 } = c1;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const d = Line(center, c1).length;
  if (
    d > r0 + r1 ||
    (d == 0 && r0 == r1) ||
    d < Math.abs(r0 - r1)
  ) {
    return undefined;
  }
  const a = divide(
    r0 * r0 - 
    r1 * r1 +
    d * d
  )(2 * d);

  const x2 = x0 + multiply(dx)(a/d);
  const y2 = y0 + multiply(dy)(a/d);
  const h = sqrt(r0 * r0 - a * a);
  const rx = multiply(-dy)(h/d);
  const ry = multiply(dx)(h/d);
  
  const xi = x2 + rx;
  const xi_p = x2 - rx;
  const yi = y2 + ry;
  const yi_p = y2 - ry;

  return [Point(xi, yi), Point(xi_p, yi_p)];
}

/**
 * 
 * @param {Point} p
 * @returns {boolean} true if the point is located on the circle's circumference. 
 */
Circle.prototype.isPointOnCircle = function(p) {
  return Line(this.center, p).length == this.radius;
}

/**
 * 
 * @param {Point} p 
 * @returns {boolean} true if the point is inside the circle (or on the circumference)
 */
Circle.prototype.isPointWithinCircle = function(p) {
  return Line(this.center, p).length <= this.radius;
}

// Props

Object.defineProperties(Circle.prototype, {
  vertices: {
    get: function() {
      const { rotation } = this;
      return [
        0,
        pi / 4,
        pi / 2,
        3 * pi / 4,
        pi,
        5 * pi / 4,
        3 * pi / 2,
        7 * pi / 4
      ].map(a => a - toRadians(rotation))
       .map(angle => this.getPointOnCircle(angle));
    }
  },

  area: {
    get: function () {
      return multiply(pi)(pow(this.radius, 2));
    },
    set: function(a) {
      this.radius = sqrt(divide(a)(pi));
      return true;
    }
  },

  diameter: {
    get: function() {
      return multiply(this.radius)(2);
    },
    set: function(d) {
      this.radius = divide(d)(2);
      return true;
    }
  },

  circumference: {
    get: function() {
      return multiply(2 * pi)(this.radius);
    },
    set: function(c) {
      this.radius = divide(c)(pi * 2);
      return true;
    }
  },

  perimeter: {
    get: function() { return this.circumference; }
  },

  apothem: {
    get: function() { return this.radius; },
    set: function(a) {
      this.radius = a;
      return true;
    }
  }
});

// Static Methods

Circle.of = ({ center, radius }) => new Circle({center, radius})

Circle.from3Points = (p1, p2, p3) => {
  if (Point.orientation(p1, p2, p3) == 0) return undefined;
  const lines = [Line(p1, p2), Line(p2, p3)];
  let perpendiculars = lines.map(l => l.getPerpendicular());
  let center = perpendiculars[0].getPointOfIntersection(perpendiculars[1]);
  if (!center) {
    debugger;
    console.log("No intersection!");
    console.log(perpendiculars)
    return undefined;
  }
  const radius = Line(center, p1).length;
  return Circle.of({ center, radius });
}

/**
 * 
 * @param {Line} line 
 * @returns {Circle} a circle, centered on the line and of the same size
 */
Circle.fromLine = line => {
  const radius = divide(line.length)(2);
  const { center } = line;
  return Circle.of({ center, radius });
}

export default Circle;
