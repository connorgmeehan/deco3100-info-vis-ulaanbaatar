/* eslint-disable no-param-reassign */
import clamp from 'clamp';
import getOffset from '../helpers/getOffset';

export const SectionSettings = {
  backgroundColor: 'rgb(125, 0, 0)',
};

class Section {
  className = 'Section';
  stickyClass = '--sticky';
  stuckClass = '--stuck';
  isStuck = false;
  height;
  id;
  childElements = [];

  viewportHeight= 0;

  progressScaler = null;

  constructor(height, name, settings) {
    console.log(`Section::constructor(height: ${height}, name: ${name})`);

    this.settings = settings;

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

    this.element.style.backgroundColor = this.settings.backgroundColor;

    this.height = height;
    this.topOffset = getOffset(this.element).y;

    document.addEventListener('scroll', this.onScroll);
  }

  addChild(sectionElement) {
    console.log(`Section::addChild(sectionElement: ${sectionElement}) -> this.childElements: ${this.childElements.length}`);
    sectionElement.parentSection = this;
    this.childElements.push(sectionElement);
    this.element.appendChild(sectionElement.element);
  }

  onScroll = () => {
    // Get current progress as float from top to bottom of section and clamp between 0 and 1
    const progress = clamp(
      (window.scrollY - this.topOffset) / (this.height - window.innerHeight),
      -0.1, 1.1,
    );

    if (this.isStuck) {
      if (window.scrollY < this.topOffset) {
        this.unstick('top');
      } else if (window.scrollY + window.innerHeight > this.topOffset + this.height) {
        this.unstick('bottom');
      }
    } else if (window.scrollY > this.topOffset
      && window.scrollY + window.innerHeight < this.topOffset + this.height) {
        this.stick();
      }
    const scaledProgress = (this.progressScaler !== null
      ? this.progressScaler.calculate(progress)
      : progress);
    for (let i = 0; i < this.childElements.length; i++) {
      const el = this.childElements[i];
      el.onScroll(scaledProgress, window.scrollY);
    }
  }

  stick() {
    this.isStuck = true;
    this.element.classList.remove(this.className + this.stickyClass);
    this.element.classList.add(this.className + this.stuckClass);
    this.element.style.bottom = null;
    this.element.style.top = null;

    const childrenToUpdate = this.childElements.filter(child => child.onStick !== undefined);
    childrenToUpdate.forEach((child) => {
      child.onStick();
    });
  }

  unstick(location) {
    this.isStuck = false;
    this.element.classList.add(this.className + this.stickyClass);
    this.element.classList.remove(this.className + this.stuckClass);
    if (location === 'top') {
      this.element.style.top = '0';
    } else if (location === 'bottom') {
      this.element.style.bottom = '0';
    }

    const childrenToUpdate = this.childElements.filter(child => child.onStick !== undefined);
    childrenToUpdate.forEach((child) => {
      child.onUnstick(location);
    });
  }

  getBackgroundColor() {
    return this.settings.backgroundColor;
  }

  setProgressScaler(progressScaler) {
    this.progressScaler = progressScaler
  }

  runUpdate() {
    this.onScroll();
  }
}

export default Section;
