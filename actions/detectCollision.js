import Line from "../Line.js";
import Circle from "../polygons/Circle.js";
import RegularPolygon from "../polygons/prototypes/RegularPolygon.js";
import { head, sort, map, distinct } from "sjb-utils/Arrays.js";
import { compose } from "sjb-utils/Functions.js";
import { min } from "sjb-utils/Math.js";
import Vector from "sjb-physics/Vector.js";

const getProjections = s => norm => {
  const getDP = pnt => pnt.toVector().dotProduct(norm);

  const getMinAndMax = (res, pnt) => {
    const dp = getDP(pnt);
    const currMin = res.length > 0 ? res[0] : null;
    const currMax = res.length > 1 ? res[1] : null;
    if (currMin === null) {
      return [dp];
    }
    if (currMax === null) {
      return dp < currMin ? [dp, res[0]] : [res[0], dp];
    }
    if (dp < currMin) {
      return [dp, res[1]];
    }
    if (dp > currMax) {
      return [res[0], dp];
    }
    return res;
  };

  const pnts = s.vertices.reduce(getMinAndMax, []);

  return pnts;
};

const getOverlap = (l1, l2) => { // 2 projections
  const [min1, max1] = l1;
  const [min2, max2] = l2;
  if (min1 >= max2 || max1 <= min2) return false;
  const differences = [
    min1 - min2,
    min1 - max2,
    max1 - min1,
    max1 - max2
  ];
  return min(differences.map(Math.abs));
}

const detectCollision = (a, b) => {
  // uses the Separating Axis Theorem
  const aIsCircle = a instanceof Circle;
  const bIsCircle = b instanceof Circle;
  let normals;

  if (aIsCircle && bIsCircle) {
    const l = Line(a.center, b.center)
    const overlapping = l.length <= a.radius + b.radius;
    if (!overlapping) return undefined;
    return l.toVector(); // not good it will be too long
  }

  if (aIsCircle) {
    const axis = compose(
      head,
      sort((a, b) => a.length - b.length),
      map(p => Line(p, a.center))
    )(b.vertices);
    const centerDistance = Line(a.center, b.center).length;
    if (axis.length > a.radius && centerDistance > a.radius) return undefined;
    normals = b.normals.concat(axis.toVector());
  }
  if (bIsCircle) {
    const axis = compose(
      head,
      sort((a, b) => a.length - b.length),
      map(p => Line(p, b.center))
    )(a.vertices);
    const centerDistance = Line(a.center, b.center).length;
    if (axis.length > b.radius && centerDistance > a.radius) return undefined;
    normals = a.normals.concat(axis.toVector());
  }
  else {
    const distance = Line(a.center, b.center).length;
    if (
      (a instanceof RegularPolygon && b instanceof RegularPolygon) && 
      distance > a.sideLength + b.sideLength
    ) {
      return undefined;
    }
    normals = a.normals.concat(b.normals);
  }

  const axes = distinct("direction")(normals);
  const aProjections = axes.map(getProjections(a));
  const bProjections = axes.map(getProjections(b));
  let dist, smallest;
  for (const i in aProjections) {
    const aP = aProjections[i];
    const bP = bProjections[i];
    const o = getOverlap(aP, bP);
    if (!o) {
      return undefined;
    }
    if (!dist || Math.abs(dist) > Math.abs(o)) {
      dist = o;
      smallest = axes[i];
      continue;
    }
  }
  return Vector.of(smallest.direction, dist / 8);
}

export default detectCollision;