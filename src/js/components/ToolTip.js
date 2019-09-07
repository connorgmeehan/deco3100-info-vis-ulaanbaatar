import GenericGraph, { GraphOptions } from '../graphs/GenericGraph';
import dateToString from '../helpers/dateToString';

class ToolTip extends GenericGraph {
  utc = null;
  station = null;
  weather = null;
  xOffset = 10;
  yOffset = 10;

  constructor(name, graphOptions, data) {
    super(name, graphOptions, data);

    this.stationsData = data.stationsData;
    this.weatherTimeData = data.weatherTimeData;
    this.name = name;

    this.element.classList.add(name);
    this.element.style.width = null;
    this.element.style.height = null;

    this.timeTitle = document.createElement('h6');
    this.timeTitle.classList.add(`Graph_${name}_Title_Time`);
    this.element.appendChild(this.timeTitle);

    this.pollutionTitle = document.createElement('h6');
    this.pollutionTitle.classList.add(`Graph_${name}_Title_Pollution`);
    this.element.appendChild(this.pollutionTitle);

    this.stationTitle = document.createElement('h6');
    this.stationTitle.classList.add(`Graph_${name}_Title_Station`);
    this.element.appendChild(this.stationTitle);

    this.weatherTitle = document.createElement('h6');
    this.weatherTitle.classList.add(`Graph_${name}_Title_Weather`);
    this.element.appendChild(this.weatherTitle);

    window.newAppState.scrollUTC.subscribe((utc) => { this.scrollUTC = utc; this.update(); });

    this.update();
  }

  update() {
    console.log('_updateElement', this);
    let activeUTC;
    if (this.selectedUTC) {
      activeUTC = this.selectedUTC;
    } else if (this.scrollUTC) {
      activeUTC = this.scrollUTC;
    } else {
      activeUTC = null;
    }
    const dateObj = dateToString(activeUTC);
    this.timeTitle.innerHTML = `Date: ${dateObj.day} ${dateObj.month} ${dateObj.year}`;
    console.log(this.timeTitle);
  }
}

export default ToolTip;
