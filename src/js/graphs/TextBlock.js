import GenericGraph from './GenericGraph';

export const ExampleTextBlockData = [
  {
    tag: 'h2',
    className: 'ExampleTitle',
    content: 'This is an example title',
  },
  {
    tag: 'p',
    className: 'ExampleParagraph',
    content: 'This is some example content',
  },
];

class TextBlock extends GenericGraph {
  shouldAlwaysShow = false;
  isShowing = true;
  startProgress = 0;
  endProgress = 1;

  constructor(name, graphOptions, data) {
    super(name, graphOptions, data);

    for (let i = 0; i < data.length; i++) {
      const node = document.createElement(data[i].tag);
      node.id = `${name}_${data[i].className}`;
      node.className = data[i].className;
      const textNode = document.createTextNode(data[i].content);
      node.appendChild(textNode);
      this.element.appendChild(node);
    }

    this.element.classList.add('Graph__Hidden');
  }

  update(progress) {
    if (!this.shouldAlwaysShow) {
      if (this.isShowing && (progress < this.startProgress || progress > this.endProgress)) {
        this.hide();
      } else if (!this.isShowing && progress > this.startProgress && progress < this.endProgress) {
        this.show();
      }
    }
  }

  setShowRange(endProgress, startProgress) {
    this.startProgress = startProgress;
    this.endProgress = endProgress;
  }

  alwaysShow() {
    this.shouldAlwaysShow = true;
    this.show();
  }

  show() {
    console.log('show');
    this.isShowing = true;
    if (this.element.classList.contains('Graph__Hidden')) {
      this.element.classList.remove('Graph__Hidden');
    }
  }

  hide() {
    console.log('hide');
    this.isShowing = false;
    if (!this.element.classList.contains('Graph__Hidden')) {
      this.element.classList.add('Graph__Hidden');
    }
  }
}

export default TextBlock;
