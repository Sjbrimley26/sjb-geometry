const normals = {
  normals: {
    get: function() {
      const { edges } = this;
      return edges.map(e => {
        const v = e.toVector();
        return v.getPerpendicular();
      });
    }
  }
};

export default normals;
