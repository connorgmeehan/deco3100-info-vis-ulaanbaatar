const GraphOptions = {
  position: { x: 200, y: 200 },
  dimensions: { width: 500, height: 500 },
};

class GenericGraph {
  element;
  data;
  graphOptions;

  constructor(name, graphOptions = null, data = null) {
    console.log(`GenericGraph::constructor(name: ${name}, options: ${graphOptions})`);
    this.element = document.createElement('div');
    this.element.classList.add('Graph');
    this.element.classList.add(`Graph_${name}`);
    this.element.id = `Graph_${name}`;

    this.element.style.width = `${graphOptions.dimensions.width}px`;
    this.element.style.height = `${graphOptions.dimensions.height}px`;
    this.element.style.top = `${graphOptions.position.y}px`;
    this.element.style.left = `${graphOptions.position.x}px`;

    this.data = data;
    this.graphOptions = graphOptions;
  }

  update = null;
  onScroll(scrollOffset, progress) {
    this.update(progress);
  }
}

export default GenericGraph;
