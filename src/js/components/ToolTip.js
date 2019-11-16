import dateToString from '../helpers/dateToString';

const thermometerHeight = 200;
const thermometerMin = -40;
const thermometerRange = 70;

const thermometerExtraPx = 5;

const pollutionHeight = 200;
const pollutionMin = 0;
const pollutionMax = 750;


class ToolTip {
  element;
  titles = {};
  isShowing = false;
  constructor(target, data) {
    this.element = target;
    this.data = data;
    this.timeTitle = target.querySelector('#Tooltip_Time');
    this.pollutionTitle = target.querySelector('#Tooltip_Pollution');
    this.pollutionBar = target.querySelector('#Pollution_Bar');
    this.weatherTitle = target.querySelector('#Tooltip_Weather');
    this.thermometerBar = target.querySelector('#Thermometer_Bar');
    this.stationTitle = target.querySelector('#Tooltip_Station');

    window.newAppState.scrollUTC.subscribe((utc) => { this.scrollUTC = utc; this.update(); });
    window.newAppState.scrollTemperature.subscribe((temp) => { this.scrollTemperature = temp; this.update(); });
    window.newAppState.selectedUTC.subscribe((utc) => { this.selectedUTC = utc; this.update(); });
    window.newAppState.selectedPollution.subscribe((pollution) => { this.selectedPollution = pollution; this.update(); });
    window.newAppState.selectedStation.subscribe((station) => { this.selectedStation = station; this.update(); });
    window.newAppState.selectedTemperature.subscribe((temp) => { this.selectedTemperature = temp; this.update(); });
    
    this.thermometerBar.style.top = `${thermometerHeight}px`;
    this.thermometerBar.style.height = '0px';

    this.pollutionBar.style.top = `${thermometerHeight}px`;
    this.pollutionBar.style.height = '0px';

    this.update();
  }

  update() {
    const {
      utc, temp, station, pollution,
    } = this.getVariables();

    if (utc != null) {
      const dateObj = dateToString(utc);
      this.timeTitle.innerText = `${dateObj.day} ${dateObj.month} ${dateObj.year}`;
    } else {
      this.timeTitle.innerHTML = '';
    }
    this.stationTitle.innerText = station !== null ? `${station}` : ' ';
    const thermometerBarRatio = (temp - thermometerMin) / thermometerRange;
    const thermometerBarHeight = thermometerBarRatio * thermometerHeight;

    this.thermometerBar.style.height = `${thermometerBarHeight}px`;
    this.thermometerBar.style.top = `${thermometerHeight - thermometerBarHeight - thermometerExtraPx}px`;

    this.weatherTitle.innerText = `${temp ? Math.abs(temp.toFixed(1)) : ' '}`;
    if (temp < 0 && !this.weatherTitle.classList.contains('Tooltip_Weather_Negative')) {
      this.weatherTitle.classList.add('Tooltip_Weather_Negative');
    } else if (temp >= 0 && this.weatherTitle.classList.contains('Tooltip_Weather_Negative')) {
      this.weatherTitle.classList.remove('Tooltip_Weather_Negative');
    }

    if (pollution) {
      console.log(pollution);
      const pollutionBarHeight = (pollution / pollutionMax) * pollutionHeight;
      console.log(pollutionBarHeight);  
      this.pollutionBar.style.height = `${pollutionBarHeight + thermometerExtraPx}px`;
      this.pollutionBar.style.top = `${thermometerHeight - pollutionBarHeight - thermometerExtraPx}px`;
  
      this.pollutionTitle.innerText = pollution ? `${pollution.toFixed(0)}` : '';
    }
  }

  getVariables() {
    let utc;
    if (this.selectedUTC) {
      utc = this.selectedUTC;
    } else if (this.scrollUTC) {
      utc = this.scrollUTC;
    } else {
      utc = null;
    }

    let temp;
    if (this.selectedTemp) {
      temp = this.selectedTemp;
    } else if (utc) {
      temp = this.getTempFromUtc(utc);
    } else if (this.scrollTemperature) {
      temp = this.scrollTemperature;
    } else {
      temp = null;
    }

    const station = this.selectedStation ? this.selectedStation : null;
    const pollution = this.selectedPollution ? this.selectedPollution : null;

    return {
      utc, temp, station, pollution,
    };
  }

  onScroll(progress) {
    if (this.isShowing && (progress < this.startProgress || progress > this.endProgress)) {
      this.hide();
    } else if (!this.isShowing && progress > this.startProgress && progress < this.endProgress) {
      this.show();
    }
  }

  setShowRange(startProgress, endProgress) {
    this.startProgress = startProgress;
    this.endProgress = endProgress;
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

  getTempFromUtc(utc) {
    const index = this.getIndexFromUtc(utc);
    return this.data.find(d => d[0] === 'Weather (C)')[1][index];
  }

  getIndexFromUtc(utc) {
    return this.data.find(d => d[0] === 'utc')[1] // gets the utc data array
      .findIndex(t => t === utc);
  }
}

export default ToolTip;
