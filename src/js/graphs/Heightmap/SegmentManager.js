import * as THREE from 'three';

export const SegmentManagerSettings = {

}

export default class SegmentManager {
    constructor(scene, camera, events, data, settings = SegmentManagerSettings) {
        this.scene = scene;
        this.camera = camera;
        this.events = events;

        this.data = data;
        this.settings = settings;

        console.log(this.data);
    }
}
