# SJB-Geometry
I originally created this library when experimenting with 2d animations on the canvas but have found it useful in other cases as well so I wanted to separate it out into its own module.

## Importing
I highly recommend using Webpack or a similar bundler with npm when using this library to avoid errors however I did my best to format it to the modern module-style of imports.

When using HTML to import parts as a script use the "module" type like so: 

``<script src="Point.js" type="module"></script>``

When using Webpack you can do this:

``import * as geometry from "sjb-geometry";``

or this:

``import { Point, polygons } from "sjb-geometry";``

## Usage
There is no graphical representation tied to this library but it can be helpful when used with one.
## Basics
### Point
Starting with the basics is Point, a 2d point in space. It is created like so:

``const location = Point(x, y)``

Points are iterable so (with destructuring) you can do handy things like this:
```javascript
const p = Point(0, 0);
const [x , y] = p;
```

### Line
Technically a line segment, a straight line between 2 points.
```javascript
const startCoords = Point(0, 0);
const endCoords = Point(10, 10);
const line = Line(startCoords, endCoords);
```
Lines have a few neat properties that we can use:
```javascript
line.start // returns Point(0, 0) here
line.end // returns Point(10, 10)
line.distance // returns 14.14
line.length // same as distance, 14.14
line.slope // returns 1
line.center // returns Point(5, 5)
line.xInt // (short for x-intercept) returns 0
line.yInt // returns 0
```
Distance is settable on lines, so you can do this:
```javascript
line.distance = 7.05
line.end // now returns Point(5, 5)
```

## Polygons
For a basic understanding of the structure of the polygons, there is one main parent Polygon class which has 2 subclasses RegularPolygon and IrregularPolygon. Regular polygons are polygons where each side is the same length (like a square). Irregular polygonns can take just about any form. 

This library implements the "standard" regular shapes, like circle, equilateral triangle, hexagon, etc. and the base RegularPolygon class is very easy to extend. It also implements a couple irregular polygons, rectangles and triangles, as they come in handy a lot and are still easy to reason about.

Custom irregular polygons can be created essentially by inheriting from the IrregularPolygon class and supplying an array of Points which make up the shape's vertices. More information and examples will be found below.

## Learning Your Shapes
### Regular Polygons
When using this library with HTML canvas it's a good idea to round the values for a couple of reasons. A) the canvas only works with integer values, using decimals will cause bugs. B) the math in this library ends up with close approximates but thanks to Javascript's less-than-perfect math, values are not exact.

All regular polygons are created the same way with either the ``new`` keyword or using the static ``of`` method. Squares are created the same way although they are a bit unusual as they inherit from Rectangles rather than directly from the RegularPolygon class.

Let's start with an equilateral triangle (the simplest regular polygon). I will show how I like to import the module but feel free to get creative.
```javascript
import { polygons, Point } from "sjb-geometry";
const { EqTriangle } = polygons;
const triangle = new EqTriangle({ 
  center: Point(5, 5),
  sideLength: 10
});
```
Note that unlike Point and Line, the new keyword is **required** when creating Polygons in this manner. However, they also have a static function "of" which can be used to create them.
```javascript
const triangle = EqTriangle.of({ 
  center: Point(5, 5),
  sideLength: 10
})
```
Polygons have all sorts of data that can be accessed. And with the power of prototypes, the individual objects remain small. The getter functions return data based on the polygon's properties rather than saving it onto the object upon creation.
```javascript
triangle.area // returns 43.35
triangle.perimeter // returns 30

t.bottom // returns the lowest y-value of the shape's vertices

triangle.apothem // returns 2.89 - the distance from the center of the shape to the middle of its edges

triangle.vertices // returns an Array of Points representing the shape's vertices.

triangle.edges // returns an Array of Lines connecting the vertices

triangle.midpoints // returns an Array of Points at the center of each edge

triangle.circumcircle // returns a new Circle, the smallest circle that can contain the shape.

triangle.inscribedCircle // returns a new Circle, the largest circle that can fit within the shape.
```

All Polygons can also be rotated, like so: `triangle.rotation = 180`. Now when you call `triangle.vertices` it will return the points rotated by that amount around the center of the polygon.

#### Circle
Next, we'll take a look at Circles, another RegularPolygon but  with a few different traits. Rather than a  sideLength, Circles are created with a radius property, like so:

`const circle = Circle.of({ center: Point(5, 5), radius: 5 });`

There are also a couple unique static methods to create a circle, `Circle.from3Points(pointA, pointB, pointC)` or `Circle.fromLine(Line(pointA, pointB))`.

Circles have a few useful properties, many of which other polygons can take advantage of with their insribed and circumscribed circles.

```javascript
circle.vertices // probably shouldn't use this a lot, returns an octagon of points on the circle
circle.diameter // returns 10
circle.circumference // returns 31.4

circle.getPointOnCircle(180) // returns the Point at the bottom of the circle
circle.isPointOnCircle(pointA) // returns a boolean, whether the Point lies on the circle's circumference.
circle.isPointWithinCircle(pointA) // returns a boolean, whether the Point lies within the circle's radius
circle.getPointsOfIntersection(circleB) // returns 2 Points where the circles intersect, or undefined

```

### Irregular Polygons
#### Rectangles

The first of the irregular polygons included in this library is Rectangle. Rectangles can also be created with the ``new`` keyword or ``of`` method, however it requires different properties.
```javascript
const rect = Rectangle.of({
  center: Point(5, 5),
  length: 5,
  width: 10
})
```
Squares inherit from Rectangles (and thus have all the following extra properties and methods) but otherwise behave identically to  RegularPolygons.

Right now irregular polygons have all the same properties as regular polygons with the exception of circumcircle, which has to be added. (Rectangle and Triangle both have this property added to their prototypes). Also important to note, the inscribedCircle method of the IrregularPolygons returns the largest circle that fits within the shape, *originating from the center*. So, it is usually possible to fit a larger circle within the circle if you could find the right place to center it.

Rectangles have a few special methods that can be quite useful.
```javascript
rect.leftmost // returns the x-value on the left side of the rectangle, in this case 0
rect.rightmost // 10
rect.topmost // 2.5
rect.bottommost // 7.5

const rect2 = Rectangle.of({
  center: Point(10, 5),
  length: 5,
  width: 10
}) // so here we create a second rectangle just to the right of the first.

rect.covers(rect2) // returns false, used to determine whether a rectangle completely overlaps another

rect.overlaps(rect2) // returns true, used to determine if the rectangles overlap at all
```

Rectangle also has a few handy static methods (other than ``of``)
```javascript
Rectangle.getOverlap(rect, rect2) // returns a new Rectangle, the area where the 2 rectagles overlap

Rectangle.MBB(Point[]) // stands for minimum bounding box, accepts an array of 3+ Points. Returns the smallest Rectangle which will contain all the given points.
```

#### Triangles

Triangles don't have anything special about them except it also has a static method `Triangle.from3Points(...points)`.

### Actions

There are a few actions included with this library, used to manipulate the shapes. Most are curried for reuseability.

```javascript
import { actions } from "sjb-geoometry"

const {
  moveRelative,
  moveTo,
  rotatePoint,
  detectCollision
} = actions;

moveRelative(10, 10)(triangle) // moves the shape's center 10 over and 10 up
const moveRight = moveRelative(5, 0) // currying
moveRight(triangle) // moves the shape 5 over

moveTo(10, 10)(triangle) // moves the shape so it is centered at 10, 10

// rotatePoint(point around which to rotate, how many degrees to rotate)(the point to rotate)
const rotate90DegreesAroundOrigin = rotatePoint(Point(0, 0), 90) 
rotate90DegreesAroundOrigin(Point(0, 10)) // returns a new point, in this case Point(10, 0)


detectCollision(shapeA, shapeB) // returns a Vector, the smallest Vector needed to separate the 2 shapes or false
// uses the Separating Axis Theorem


```

### Data Structures

#### R-Tree
Right now this library only includes one data structure, the r-tree (short for rectangle tree). It is used for collision detection but I suppose it could be used for other things. When combined with a collision detection function, it removes objects that are far away, so you don't have to check every object against each other. It is used like so:

```javascript
import { RTree } from "sjb-geometry/datastructures"
import { detectCollision, moveRelative } from "sjb-geometry/actions"

const length = 100;
const width = 100;
const center = Point(50, 50)
/// usually you want the RTree to contain the entire canvas

const tree = new RTree(length, width, center)
const shapes = [
  // some array of different Polygons you want to examine
]

function onCollide = (shapeA, shapeB, vector) {
  const dx = vector.x
  const dy = vector.y
  moveRelative(dx, dy)(shapeA)
  moveRelative(-dx, -dy)(shapeB)
  // so in this example the 2 shapes will just move in opposite directions
}

function loop() {
  tree.empty() // clears the R-Tree, this is necessary to "refresh" the locations of the shapes
  tree.bulkInsert(shapes) // add the shapes to the R-Tree
  /*
    This is possible although less efficient in most cases
    shapes.forEach(shape => tree.insertShape(shape))
  */
  tree.detectCollision(detectCollision, onCollide)
  // you don't have to use this detectCollision function, however the onCollide callback expects a returned value from the collision detection function 
}
```