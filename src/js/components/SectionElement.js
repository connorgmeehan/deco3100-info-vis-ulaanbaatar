import Sticky from 'sticky-js';

class SectionElement {
  parentSection;
  element;
  className = 'Element';
  sticky;

  child;

  padding = { top: 0, bottom: 0 };
  viewportHeight = 0;
  elementHeight = 0;
  parentDimensions = 0;

  constructor(parentSection, isStickyElement, padding = null) {
    console.log(`SectionElement::constructor(section: ${parentSection}, isStickyElement: ${isStickyElement}, padding: ${padding})`);
    this.element = document.createElement('div');
    this.parentSection = parentSection;
  }

  addChild(graph) {
    this.element.appendChild(graph.element);
    this.child = graph;
  }

  addClass(className) {
    this.element.classList.add(className);
  }

  onScroll(scrollOffset, progress) {
    this.child.onScroll(scrollOffset, progress);
  }
}

export default SectionElement;
