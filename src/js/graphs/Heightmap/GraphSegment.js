import * as THREE from 'three';
import PollutionBlob from './PollutionBlob';

export const GraphSegmentSettings = {
    segmentStepDistance: 2,
    scrollUtcOffset: 2,
}

export class GraphSegmentVm {
    constructor(utc, temperature, stations) {
        this.utc = utc;
        this.temperature = temperature;
        this.stations = stations;
    }
}

export default class GraphSegment {
    constructor(scene, events, utc, temperature, settings = GraphSegmentSettings) {
        this.scene = scene;
        this.events = events;
        this.utc = utc;
        this.temperature = temperature;
        this.settings = settings;

        this.init();

        this.pollutionBlobs = [];

        this.notifyUTCCallback = this.notifyUTCCallback.bind(this);
    }

    init() {
        this.obj = new THREE.Object3D();
        this.obj.position.set(0, 0, 0);
        this.scene.add(this.obj);
    }

    addStationBlob(name, pollution, x, z) {
        const blob = new PollutionBlob(this.obj, this.events, name, pollution, this.notifyUTCCallback);
        blob.setPosition(x, 0, z);
        this.pollutionBlobs.push(blob);
    }

    setY(y) {
        this.obj.position.setY(y);
        if (y < 0) {
            this.pollutionBlobs.forEach((blob) => { blob.setVisible(false); });
        } else {
            const { scrollUtcOffset, segmentStepDistance } = this.settings;
            if (y > (scrollUtcOffset - 1) * segmentStepDistance && scrollUtcOffset * segmentStepDistance > y) {
                window.newAppState.scrollUTC.notify(this.utc);
                window.newAppState.scrollTemperature.notify(this.temperature);
            }
            this.pollutionBlobs.forEach((blob) => { blob.setVisible(true); });
        }
    }

    notifyUTCCallback(mouseOver = false) {
        if (mouseOver) {
            window.newAppState.selectedUTC.notify(this.utc);
            window.newAppState.selectedTemperature.notify(this.temperature);
        } else {
            window.newAppState.selectedUTC.notify(null);
            window.newAppState.selectedTemperature.notify(null);
        }
    }
}
