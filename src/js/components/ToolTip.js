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

    const title = document.createElement('h5');
    title.classList.add(`Graph_${name}_Title`);
    this.element.appendChild(title);

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


    window.appState.hoveredTime.subscribe(this._onHoverTimeChange);
    window.appState.hoveredStation.subscribe(this._onHoverStationChange);
    document.addEventListener('mousemove', this._onMouseMove);
  }

  _onMouseMove = (event) => {
    this.element.style.left = `${this.xOffset + event.clientX}px`;
    this.element.style.top = `${this.yOffset + event.clientY}px`;
  }

  _onHoverTimeChange = (utc) => {
    this.utc = utc;
    if (this.utc !== null) {
      this.weather = this.weatherTimeData.find(el => el.utc === this.utc).temp;
    }
    if (this.station !== null) {
      this.pollution = this._calculatePollution();
    }
    this._updateElement();
  }

  _onHoverStationChange = (station) => {
    this.station = station;
    if (this.utc !== null) {
      this.pollution = this._calculatePollution();
    }
    this._updateElement();
  }

  _calculatePollution() {
    console.log(this.utc, this.station);

    const stationData = this.stationsData
      .find(stationRow => stationRow[0] === this.station);
    console.log(stationData);
    const pollutionVal = stationData[1].find(el => el.utc === this.utc);
    console.log(stationData, pollutionVal);
    return pollutionVal.val;
  }

  _updateElement() {
    if (this.utc) {
      const dateObject = dateToString(this.utc);
      this.timeTitle.innerHTML = `Date: ${dateObject.day}, ${dateObject.month}, ${dateObject.year}`;
      this.weatherTitle.innerHTML = `Weather: ${this.weather} &deg;C`
    } else {
      this.timeTitle.innerHTML = '';
    }
    if (this.station) {
      this.timeTitle.innerHTML = `Station: ${this.station}`;
    } else {
      this.timeTitle.innerHTML = '';
    }

    if (this.pollution) {
      this.pollutionTitle.innerHTML = `PM2.5 (&micro;/m&sup3;): ${this.pollution}`;
    } else {
      this.pollutionTitle.innerHTML = '';
    }

    if (this.utc || this.station) {
      console.log('should show')
      if (!this.element.classList.contains(`${this.name}__Show`)) {
        this.element.classList.add(`${this.name}__Show`);
      }
    } else if (this.element.classList.contains(`${this.name}__Show`)) {
      this.element.classList.remove(`${this.name}__Show`);
    }
  }
}

export default ToolTip;
