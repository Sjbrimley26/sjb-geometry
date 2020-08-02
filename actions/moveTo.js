import Point from "../Point.js";

const moveTo = (x, y) => shape => {
  shape.center = Point(x, y);
  return shape;
};

export default moveTo;