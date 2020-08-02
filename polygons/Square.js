import Rectangle from "./Rectangle.js";
import circumcircle from "./prototypes/props/circumcircle.js";
import bottom from "./prototypes/props/bottom.js";

const Square = function({ center, sideLength }) {
  Rectangle.call(this, {
    center,
    length: sideLength,
    width: sideLength
  });
  this.sideLength = sideLength;
}

Square.prototype = Object.create(Rectangle.prototype);

Object.defineProperties(Square.prototype, {
  ...circumcircle,
  ...bottom
});

Square.of = ({ center, sideLength }) => new Square({ center, sideLength})

export default Square;
