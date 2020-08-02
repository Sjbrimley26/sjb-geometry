import Rectangle from "../polygons/Rectangle.js";
import Line from "../Line.js";

import { compose } from "sjb-utils/Functions.js";
import { head, sort, compact } from "sjb-utils/Arrays.js";

/**
 * @typedef Node
 * @type {object}
 * @property {Rectangle} box
 */

/**
 * Represents a group of Nodes.
 * @param {Rectangle} box 
 * @param {RTree} the root Node of the RTree.
 */
function IndexNode(box, tree) {
  this.box = box;
  /** @type {Node[]} */
  this.children = [];
  this.root = tree;
}

/**
 * Represents a single Node.
 * @param {Rectangle} box 
 * @param {Node} obj 
 */
function LeafNode(box, obj) {
  this.box = box;
  this.obj = obj;
}

function RTree(length, width, center) {
  this.box = Rectangle.of({
    center,
    length,
    width
  });
  /** @type {Node[]} */
  this.children = [];
}

const maxNumberOfChildren = 3;

// TODO - upgrade to an R* Tree
// step 1. parent should be selected by the minimum overlap size or preferably no overlaps.
// step 2. when an index node fills up, rather than change one of its leaves into an index,
//         it needs to remove the least-fitting leaf and add the new one, then re-insert the
//         old leaf back into the tree.

const insertShape = function(shape, recursive = true) {
  const mbb = Rectangle.MBB(shape.vertices);

  // Adds the shape into the current Node if there is space for it.
  if (this.children.length < maxNumberOfChildren) {
    const leaf = new LeafNode(mbb, shape);
    this.children.push(leaf);
    return;
  }

  // FIX Now the tree is not balanced.
  if (
    recursive &&
    this.children.length == maxNumberOfChildren &&
    this.children.some(c => c instanceof LeafNode)
  ) { // && this.children.every(c => c instanceof LeafNode)
    const leaf = new LeafNode(mbb, shape);
    this.children.push(leaf);
    const furthest = [...this.children].sort((a, b) => {
      const ad = Line(a.box.center, this.box.center).distance;
      const bd = Line(b.box.center, this.box.center).distance;
      return ad - bd;
    })[0];
    this.children = this.children.filter(c => c !== furthest);
    const rootNode = this instanceof IndexNode ? this.root : this;
    if (furthest instanceof LeafNode) {
      rootNode.insertShape(furthest.obj, false);
    } else {
      appendObjectsToList(() => true)([], furthest.children).forEach(node => {
        rootNode.insertShape(node.obj, false);
      })
    }
    return;
  }
  
  // Otherwise, check the Node's children to see if any are LeafNodes and can be converted to an IndexNode
  /** @type {Node[]} */
  let eligibleParents = this.children.filter(child => child instanceof LeafNode);
  
  // If all are IndexNodes, eligibleParents becomes any Node with empty spaces to add the shape.
  eligibleParents = eligibleParents.length === 0 
    ? this.children.filter(c => c.children.length < maxNumberOfChildren)
    : eligibleParents;

  // If all the children are full, each child becomes elligible.
  // The function works recursively so it will check each child to determine which
  // is most suitable to hold the given shape.
  eligibleParents = eligibleParents.length === 0 ? this.children : eligibleParents;

  // For each parent, determine the size of the box if the shape is added.
  const potentialBoxes = eligibleParents.map(child => {
    const { box } = child;
    const pnts = box.vertices.concat(mbb.vertices);
    return { child, box: Rectangle.MBB(pnts) };
  });

  potentialBoxes.forEach(candidate => {
    const siblings = this.children.filter(c => c !== candidate.child);
    const overlapSize = siblings.reduce((size, sib) => {
      const overlap = Rectangle.getOverlap(sib.box, candidate.box);
      if (overlap) {
        return size + overlap.perimeter;
      }
      return size;
    }, 0);
    candidate.overlapSize = overlapSize;
  });

  const smallestBox = compose(
    head,
    sort((a, b) => a.overlapSize - b.overlapSize),
    sort((a, b) => a.box.perimeter - b.box.perimeter) // was originally sorting a.box.area - b.box.area of potentialBoxes only
  )(potentialBoxes);

  const i = this.children.indexOf(smallestBox.child);
  
  // If the child is already an IndexNode, the shape is added into it.
  if (this.children[i] instanceof IndexNode) {
    this.children[i].insertShape(shape, recursive);
    this.children[i].box = smallestBox.box;
    return;
  }

  // If the child is a LeafNode, an IndexNode is created and both the shape and the LeafNode's shape are added to the new IndexNode.
  const child = this.children[i];
  const rootNode = this instanceof IndexNode ? this.root : this;
  const node = new IndexNode(smallestBox.box, rootNode);
  node.insertShape(shape);
  node.insertShape(child.obj);
  this.children[i] = node;
}

RTree.prototype.insertShape = insertShape;
IndexNode.prototype.insertShape = insertShape;

RTree.prototype.bulkInsert = function(shapes) {
  // startingPoints is an array containing the leftmost and rightmost shapes.
  const startingPoints = shapes.reduce(([left, right], p) => {
    let l = p.center.x < left.center.x ? p : left;
    let r = p.center.x > right.center.x ? p : left;
    return [l, r];
  }, [shapes[0], shapes[shapes.length - 1]]);

  const remainder = sort((a, b) => a.center.x - b.center.x)(shapes.filter(p => !startingPoints.includes(p))); // everything else

  const first2 = remainder.slice(0, 2);
  const last2 = remainder.slice(remainder.length - 2, remainder.length);
  const mid = remainder[Math.floor(remainder.length / 2)]; // the item closest to the center of all the shapes.

  const rest = remainder.filter(x => {
    return !first2.includes(x) 
      && !last2.includes(x)
      && x !== mid
  });

  const pnts = [
    ...startingPoints,
    mid,
    ...first2,
    ...last2,
    ...rest
  ]; // sorting them helped a lot actually

  pnts.forEach(p => this.insertShape(p));
};

RTree.prototype.empty = function() {
  this.children = [];
  return this;
}

/**
 * @param {Node[]} children
 */
const checkIfChildrenOverlap = children => {
  if (children.length < 2) return false;
  const dups = [...children]; // a duplication of the original array to compare against
  /** @type {Map<{Object}, Node[]>[]} */
  const overlaps = compact(children.map(child => {
    // child = nodeA
    // c = nodeB

    /** @type {Node[]} */
    // for each child an "overlap" array is created, containing each of the Nodes that the child overlaps.
    const overlap = [];

    dups.forEach(c => {
      if (c == child) return;
      if (child.box.overlaps(c.box)) {
        overlap.push(c);
      }
    });

    if (overlap.length == 0) return undefined;

    /** @type {Map<{Object}, Node[]>} */
    const res = new Map();
    res.set(child, overlap);
    return res;
  }));

  if (overlaps.length == 0) return false;

  return overlaps;
}

/**
 * A utility function for adding all of the descendants of the given children array
 * and adding them to the provided list, which is then returned. 
 */

const appendObjectsToList = filterFn => (list, children) => {
  children.forEach(child => {
    if (child instanceof LeafNode) {
      if (filterFn(child)) {
        list.push(child);
      }
    } else {
      appendObjectsToList(filterFn)(list, child.children);
    }
  });
  return list;
}

/**
 * Used to determine unique pairings of the items in the array.
 * @param {any[]} arr 
 * @returns {Array[]} an array of pairs, each containing 2 items
 * @example 
 * getPairCombinations([1, 2, 3])
 * // returns [[1, 2], [1, 3], [2, 3]]
 */
const getPairCombinations = arr => {
  if (arr.length < 2) return [];
  return arr.reduce((combinations, item, i, items) => {
    if (i == items.length - 1) return combinations;
    for (let j = i + 1; j < items.length; j++) {
      combinations.push([item, items[j]]);
    }
    return combinations;
  }, [])
}

/**
 * @callback collisionDetector
 * @param {Object} shapeA
 * @param {Object} shapeB
 * @returns {boolean} whether they collide.
 */

/**
 * @callback collider
 * @param {Object} shapeA 
 * @param {Object} shapeB
 * @param {Vector} vec represents the minimum vector to separate A and B.
 */

/**
 * 
 * @param {collisionDetector} detectorFn collision detection function. 
 * @param {collider} cb function triggered when the shapes do collide. 
 */
const detectCollision = function(detectorFn, collisionCb) {
  const cCount = this.children.length;
  if (cCount < 2) return;
  // check sibling collision
  checkSiblingCollision(this.children, detectorFn, collisionCb);
  this.children.filter(x => x instanceof IndexNode).forEach(node => {
    node.detectCollision(detectorFn, collisionCb);
  });
}

/**
 * 
 * @param {Node[]} children
 * @param {collisionDetector} detectorFn collision detection function. 
 * @param {collider} cb function triggered when the shapes do collide. 
 */
const checkSiblingCollision = (children, detectorFn, collisionCb) => {
  const pairings = getPairCombinations(children);
  pairings.forEach(([c1, c2]) => {
    if (!c1.box.overlaps(c2.box)) return false;
    if (c1 instanceof LeafNode && c2 instanceof LeafNode) {
      let vec = detectorFn(c1.obj, c2.obj);
      if (!vec) return false;
      return collisionCb(c1.obj, c2.obj, vec);
    }
    // Otherwise if one or more are IndexNodes
    const overlapRec = Rectangle.getOverlap(c1.box, c2.box);
    let inOverlap = appendObjectsToList(node => overlapRec.overlaps(node.box))([], [c1, c2])

    const possibleOverlaps = getPairCombinations(inOverlap);

    if (possibleOverlaps.length == 0) return;

    const realOverlaps = possibleOverlaps.map(([nodeA, nodeB]) => {
      if (!nodeA.box.overlaps(nodeB.box)) return false;
      const vec = detectorFn(nodeA.obj, nodeB.obj);
      if (!vec) return false;
      collisionCb(nodeA.obj, nodeB.obj, vec);
      return true;
    })
    //debugger;
  })
}

RTree.prototype.detectCollision = detectCollision;
IndexNode.prototype.detectCollision = detectCollision;

export default RTree;

