import Line from "../../../Line.js";

const edges = {
  edges: {
    get: function() {
      const { vertices } = this;
      const edgesArr = [];
      for (let i = 0; i < vertices.length; i++) {
        if (i === vertices.length - 1) {
          edgesArr.push(Line(vertices[i], vertices[0]));
          break;
        }
        edgesArr.push(Line(vertices[i], vertices[i + 1]));
      }
      return edgesArr;
    }
  }
};

export default edges;
