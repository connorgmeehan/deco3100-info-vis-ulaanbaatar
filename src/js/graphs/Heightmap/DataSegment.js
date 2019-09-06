import * as THREE from 'three';
import PollutionBlob from './PollutionBlob';

 export class GraphSegmentSettings {
    constructor(utc, temperature, stations) {
        this.utc = utc;
        this.temperature = temperature;
        this.stations = stations;
    }
}

export default class GraphSegment {
    constructor(scene, events, utc, temperature) {
        this.scene = scene;
        this.events = events;
        this.utc = utc;
        this.temperature = temperature;

        this.initObject();

        this.stationBlobs = [];
    }

    initObject() {
        this.obj = new THREE.Object3D();
    }

    addStationBlob(name, pollution, x, z) {
        const blob = new PollutionBlob(this.scene, this.events, pollution);
        blob.setPosition(x, 0, z);
    }
}
