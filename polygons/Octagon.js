import RegularPolygon from "./prototypes/RegularPolygon.js";

function Octagon({ center, sideLength }) {
  RegularPolygon.call(this, {
    center,
    sides: 8,
    sideLength
  });
}

Octagon.prototype = Object.create(RegularPolygon.prototype);

Octagon.of = ({ center, sideLength }) => new Octagon({ center, sideLength })

export default Octagon;
