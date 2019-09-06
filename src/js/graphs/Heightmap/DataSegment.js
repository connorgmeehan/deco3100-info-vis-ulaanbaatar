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
        this.obj.position.set(0, 0, 0);
        this.scene.add(this.obj);
    }

    addStationBlob(name, pollution, x, z) {
        const blob = new PollutionBlob(this.obj, this.events, pollution);
        blob.setPosition(x, 0, z);
    }

    setY(y) {
        this.obj.position.setY(y);
    }
}
