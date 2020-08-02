import Point from "../Point.js";
import { cos, sin, toRadians } from "sjb-utils/Math.js";

const rotatePoint = (origin, angle) => point => {
  const s = sin(toRadians(angle));
  const c = cos(toRadians(angle));
  const p = {
    ...point
  };

  p.x -= origin.x;
  p.y -= origin.y;

  const x = (p.x * c - p.y * s) + origin.x;
  const y = (p.x * s + p.y * c) + origin.y;

  return Point(x, y);
}

export default rotatePoint;