import RegularPolygon from "./prototypes/RegularPolygon.js";

function Pentagon({ center, sideLength }) {
  RegularPolygon.call(this, {
    center,
    sides: 5,
    sideLength
  });
}

Pentagon.prototype = Object.create(RegularPolygon.prototype);

Pentagon.of = ({ center, sideLength }) => new Pentagon({ center, sideLength })

export default Pentagon;
