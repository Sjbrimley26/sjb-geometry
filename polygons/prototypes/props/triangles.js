import Line from "../../../Line.js"
import { flatten } from "sjb-utils/Arrays.js"


// use with regular polygons only
const triangles = {
  triangles: {
    get: function() {
      const { vertices } = this;
      if (vertices.length === 3) {
        return new Float32Array(vertices)
      }
      const triangles = [];
      const origin = vertices[0];
      const others = vertices.slice(1);
      const lines = others.map(point => Line(origin, point))
      for (let i = 0; i < lines.length - 1; i++) {
        const line1 = lines[i];
        const line2 = lines[i+1]
        const x = line1.start;
        const y = line1.end;
        const z = line2.end;
        triangles.push([...x, ...y, ...z])
      }
      return new Float32Array(flatten(triangles));
    }
  }
}

export default triangles;

