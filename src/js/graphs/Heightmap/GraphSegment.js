import * as THREE from 'three';
import PollutionBlob from './PollutionBlob';
import TemperatureDisk, { TemperatureDiskSettings } from './TemperatureDisk';

export const GraphSegmentSettings = {
    segmentStepDistance: 2,
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
    }

    init() {
        this.obj = new THREE.Object3D();
        this.obj.position.set(0, 0, 0);
        this.scene.add(this.obj);

        const temperatureDiskSettings = TemperatureDiskSettings;
        temperatureDiskSettings.height = this.settings.segmentStepDistance;
        this.temperatureDisk = new TemperatureDisk(this.scene, this.obj, this.events, this.utc, this.temperature, temperatureDiskSettings);
    }

    addStationBlob(name, pollution, x, z) {
        const blob = new PollutionBlob(this.obj, this.events, name, pollution);
        blob.setPosition(x, 0, z);
        this.pollutionBlobs.push(blob);
    }

    setY(y) {
        this.obj.position.setY(y);
        if (y < 0) {
            this.temperatureDisk.setVisible(false);
            this.pollutionBlobs.forEach((blob) => { blob.setVisible(false); });
        } else {
            this.temperatureDisk.setVisible(true);
            this.pollutionBlobs.forEach((blob) => { blob.setVisible(true); });
        }
    }
}
