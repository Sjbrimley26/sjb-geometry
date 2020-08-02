import RegularPolygon from "./prototypes/RegularPolygon.js";

function EqTriangle({ center, sideLength }) {
  RegularPolygon.call(this, {
    center,
    sides: 3,
    sideLength
  });
}

EqTriangle.prototype = Object.create(RegularPolygon.prototype);

EqTriangle.of = ({ center, sideLength }) => new EqTriangle({ center, sideLength })

export default EqTriangle;
