import * as polygons from "./polygons/index.js";
import Line from "./Line.js";
import Point from "./Point.js";
import * as data_structures from "./datastructures/index.js";
import * as actions from "./actions/index.js"

const rect = polygons.Rectangle.of({
  center: Point(5, 5),
  length: 5,
  width: 10
})

const rect2 = polygons.Rectangle.of({
  center: Point(10, 5),
  length: 5,
  width: 10
})

const data = [
  rect.leftmost,
  rect.rightmost,
  rect.bottommost,
  rect.topmost,
  polygons.Rectangle.getOverlap(rect, rect2)
]

data.map(x => console.log(x))

export {
  actions,
  polygons,
  data_structures,
  Line,
  Point
};
