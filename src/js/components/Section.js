import getOffset from '../helpers/getOffset';

class Section {
  className = 'Section';
  stickyClass = '--sticky';
  stuckClass = '--stuck';
  isStuck = false;
  height;
  id;
  childElements = [];

  viewportHeight= 0;

  constructor(height, name) {
    console.log(`Section::constructor(height: ${height}, name: ${name})`);

    const track = document.createElement('div');
    this.track = document.getElementById('app').appendChild(track);
    this.track.className = `${this.className}_Track`;
    this.track.id = `${this.className}_${name}_Track`;
    this.track.style.height = `${height}px`;

    const node = document.createElement('div');
    this.element = this.track.appendChild(node);
    this.id = `${this.className}_${name}`;
    this.element.id = this.id;
    this.element.className = this.className;

    this.height = height;
    this.topOffset = getOffset(this.element).y;

    document.addEventListener('scroll', this.onScroll);
  }

  addChild(sectionElement) {
    console.log(`Section::addChild(sectionElement: ${sectionElement}) -> this.childElements: ${this.childElements.length}`);
    this.childElements.push(sectionElement);
    this.element.appendChild(sectionElement.element);
  }

  onScroll = (e) => {
    let progress = (window.scrollY + window.innerHeight / 2 - this.topOffset.y) / this.height;
    progress = (progress < 0.0 ? 0.0 : progress);
    progress = (progress > 1.0 ? 1.0 : progress);

    if (window.scrollY < this.topOffset) {
      if (this.isStuck) {
        this.unstick('top');
      }
    } else if (window.scrollY + window.innerHeight > this.topOffset + this.height) {
      if (this.isStuck) {
        this.unstick('bottom');
      }
    } else if (!this.isStuck) {
      this.stick();
    }


    for (let i = 0; i < this.childElements.length; i++) {
      const el = this.childElements[i];

      el.onScroll(window.scrollY, progress);
    }
  }

  stick() {
    console.log('stick');
    this.isStuck = true;
    this.element.classList.remove(this.className + this.stickyClass);
    this.element.classList.add(this.className + this.stuckClass);
    this.element.style.bottom = null;
    this.element.style.top = null;
  }

  unstick(location) {
    console.log('unstick');
    this.isStuck = false;
    this.element.classList.add(this.className + this.stickyClass);
    this.element.classList.remove(this.className + this.stuckClass);
    if (location === 'top') {
      this.element.style.top = '0';
    } else if (location === 'bottom') {
      this.element.style.bottom = '0';
    }
  }
}

export default Section;
