import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

const BackgroundColors = [
    0x489936, // #489936
    0x019A64, // #019A64
    0x1782A3, // #1782A3
    0x0286DE, // #0286DE
    0x106498, // #106498
    0x093754, // #093754
    0x041621, // #041621
];

class BackgroundUpdater {
    constructor(renderer, sectionDomElement, data) {
        this.renderer = renderer;
        this.sectionDomElement = sectionDomElement;
        this.data = data;

        this.maxTemp = Math.max(...this.data.weatherData[1]);
        this.minTemp = Math.min(...this.data.weatherData[1]);
        this.colors = BackgroundColors.map((color) => {
            const threeColor = new THREE.Color().setHex(color);
            return new THREE.Color(threeColor.r, threeColor.g, threeColor.b);
        });
        this.color = this.colors[0];
        this.sectionDomElement.style.background = `rgb(${this.color.r * 255}, ${this.color.g * 255}, ${this.color.b * 255})`;
        this.renderer.setClearColor(this.color);

        console.log(data);

        this.bindEvents();
    }

    bindEvents() {
        window.newAppState.scrollUTC.subscribe(utc => this._onUTCUpdate(utc));
    }

    _onUTCUpdate(utc) {
        const color = this._getColorFromUTC(utc);
        this.colorTween = new TWEEN.Tween(this.color)
            .to(color, 300)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                this.renderer.setClearColor(this.color);
                this.sectionDomElement.style.background = `rgb(${this.color.r * 255}, ${this.color.g * 255}, ${this.color.b * 255})`;
            })
            .start();
    }

    _getColorFromUTC(utc) {
        const index = this.data.stationsData.index[1].findIndex(el => el === utc);
        const temperature = this.data.weatherData[1][index];

        const tempDifference = Math.abs(this.maxTemp - this.minTemp);
        const scaledTemperature = (temperature + Math.abs(0 - this.minTemp)) / tempDifference;
        const colorIndex = BackgroundColors.length - Math.floor(scaledTemperature * BackgroundColors.length);
        return this.colors[colorIndex];
    }
}

export default BackgroundUpdater
