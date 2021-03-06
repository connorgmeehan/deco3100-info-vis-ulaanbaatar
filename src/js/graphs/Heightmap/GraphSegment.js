import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import PollutionBlob from './PollutionBlob';
import SegmentTextDisk from './SegmentTextDisk';

export const GraphSegmentSettings = {
    segmentStepDistance: 2,
    scrollUtcOffset: 2,
}

export class GraphSegmentVm {
    constructor(utc, averagePollution, temperature, stations, text) {
        this.utc = utc;
        this.averagePollution = averagePollution;
        console.log(this);
        this.temperature = temperature;
        this.stations = stations;
        this.text = text !== 'na' ? text : null;
    }
}

export default class GraphSegment {
    constructor(scene, events, utc, temperature, averagePollution, settings = GraphSegmentSettings) {
        this.scene = scene;
        this.events = events;
        this.utc = utc;
        this.temperature = temperature;
        this.averagePollution = averagePollution;
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

    addPollutionBlob(name, pollution, x, z) {
        const blob = new PollutionBlob(this.obj, this.events, name, pollution, this.notifyUTCCallback);
        blob.setPosition(x, 0, z);
        this.pollutionBlobs.push(blob);
    }

    addSegmentTextDisk = (text) => { this.textDisk = new SegmentTextDisk(this.obj, this.events, this.utc, text) };
    setOpacity = opacity => this.pollutionBlobs.forEach((blob) => { blob.setOpacity(opacity); });
    animateOpacityOnBlobs(opacity) { this.pollutionBlobs.forEach((blob) => { blob.animateOpacity(opacity) }) }
    setTextCircleVisible(visible) {
        if (this.textDisk) this.textDisk.setCircleVisible(visible);
    }
    setTextScale(x, y, z) {
        if (this.textDisk) this.textDisk.setScale(x, y, z);
    }
    animateScaleOnTextDiskCircle(x, y, z) {
        if (this.textDisk) this.textDisk.animateScaleOnCircle(x, y, z);
    }
    setY(y) {
        this.obj.position.setY(y);
        if (y < 0) {
            this.pollutionBlobs.forEach((blob) => { blob.setVisible(false); });
            if (this.textDisk) {
                this.textDisk.setVisible(false);
            }
        } else {
            const { scrollUtcOffset, segmentStepDistance } = this.settings;
            if (y > (scrollUtcOffset - 1) * segmentStepDistance && scrollUtcOffset * segmentStepDistance > y) {
                window.newAppState.scrollUTC.notify(this.utc);
                window.newAppState.scrollTemperature.notify(this.temperature);
                window.newAppState.scrollPollution.notify(this.averagePollution);
            }

            if (this.textDisk) {
                this.textDisk.setVisible(true);
            }
            this.pollutionBlobs.forEach((blob) => { blob.setVisible(true); });
        }
    }

    notifyUTCCallback(mouseOver = false) {
        if (mouseOver) {
            window.newAppState.selectedUTC.notify(this.utc);
            window.newAppState.selectedTemperature.notify(this.temperature);
        } else {
            window.newAppState.selectedUTC.tryUnset(this.utc);
            window.newAppState.selectedTemperature.tryUnset(this.temperature);
        }
    }

    updatePollutionBlobPosition(name, newX, newZ) {
        const blob = this.pollutionBlobs.find(b => b.name === name);
        const blobPosition = blob.mesh.position;
        const targetPosition = { x: newX, y: blobPosition.y, z: newZ };
        const moveTween = new TWEEN.Tween(blobPosition)
            .to(targetPosition, 250)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                blob.setPosition(blobPosition.x, blobPosition.y, blobPosition.z);
            })
            .start();
    }
}
