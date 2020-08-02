import Point from "../Point.js";
import Polygon from "./prototypes/Polygon.js";
import Circle from "./Circle.js";
import Line from "../Line.js";
import { rotatePoint } from "../actions/index.js";
import { max } from "sjb-utils/Math.js";

/** 
 * @param  {Point[]} points 3 points
 */
function Triangle(...points) {
  this.sides = 3;
  this._vertices = [...points];
  this.rotation = 0;
}

Triangle.prototype = Object.create(Polygon.prototype);

Object.defineProperties(Triangle.prototype, {
  center: {
    get: function() {
      const { _vertices } = this;
      const [s0, s1, s2] = _vertices;
      const edges = [
        Line(s0, s1),
        Line(s1, s2),
        Line(s2, s0)
      ];
      const midpoints = edges.map(e => e.center);
      const [ignore, e0, e1] = midpoints;
      const l0 = Line(s0, e0);
      const l1 = Line(s1, e1);
      return l0.getPointOfIntersection(l1);
    },

    set: function({ x, y }) {
      const { center } = this;
      const dx = x - center.x;
      const dy = y - center.y;
      this._vertices = this._vertices.map(p => {
        p.x += dx;
        p.y += dy;
        return p;
      });
      return true;
    }
  },

  inscribedCircle: {
    get: function() {
      const { center, apothem } = this;
      return Circle.of({ center, radius: apothem });
    }
  },

  vertices: {
    get: function() {
      const { rotation, _vertices, center } = this;
      return _vertices.map(rotatePoint(center, rotation));
    }
  },

  circumcircle: {
    get: function() {
      const { vertices, center } = this;
      const furthest = max(vertices.map(p => Line(p, center).length));
      return Circle.of({ center, radius: furthest });
    }
  }
});

/**
 * @param  {Point[]} points 
 * @returns {Triangle}
 */
Triangle.from3Points = function(...points) {
  return new Triangle(...points);
}

export default Triangle;
