/* eslint-disable no-unused-vars */
export class GraphEvent {
  constructor(min, max, startFn, endFn) {
    this.min = min;
    this.max = max;
    this.startFn = startFn;
    this.endFn = endFn;
    this.isActive = false;
  }
  update(progress) {
    if (!this.isActive && this.isInsideOf(progress)) {
      this.isActive = true;
      this.startFn.call();
    } else if (this.isActive && !this.isInsideOf(progress)) {
      this.isActive = false;
      this.endFn.call();
    }
  }
  isInsideOf = progress => this.min < progress && progress < this.max;
}

export class GraphOptions {
  positions = { x: -1, y: -1 };
  dimensions = { width: -1, height: -1 };
  anchor = 'left';

  constructor(x, y, width, height, alignment = 'left', verticleAlignment = 'top') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.alignment = alignment;
    this.verticleAlignment = verticleAlignment;
  }

  getWidth() {
    return `${this.width}px`
  }
  getHeight() {
    return `${this.height}px`
  }
  getX() {
    return `${this.x}px`
  }
  getY() {
    return `${this.y}px`
  }
  getAlignment() {
    return this.alignment;
  }
  getVerticleAlignment() {
    return this.verticleAlignment;
  }
}

class GenericGraph {
  element;
  data;
  graphOptions;
  events = [];

  constructor(name, graphOptions = null, data = null) {
    console.log(`GenericGraph::constructor(name: ${name}, options: ${graphOptions})`);
    this.element = document.createElement('div');
    this.element.classList.add('Graph');
    this.element.classList.add(`Graph_${name}`);
    this.element.id = `Graph_${name}`;

    if (graphOptions) {
      this.element.style.width = graphOptions.getWidth();
      this.element.style.height = graphOptions.getHeight();
      this.element.style[graphOptions.getAlignment()] = graphOptions.getX();
      this.element.style[graphOptions.getVerticleAlignment()] = graphOptions.getY();
    }

    this.data = data;
    this.graphOptions = graphOptions;
  }

  onScroll(_progress, _scrollOffset = 0) {
    // todo add throttling if needed
    this.update(_progress, _scrollOffset);
  }

  // eslint-disable-next-line class-methods-use-this
  update(_progress, _scrollOffset = 0) {
    // Stub
  }

  addProgressEvent(min, max, startFn, endFn) {
    console.log(`Adding new progress event from ${min} to ${max}`, this);
    this.events.push(new GraphEvent(min, max, startFn, endFn));
  }
}

export default GenericGraph;
