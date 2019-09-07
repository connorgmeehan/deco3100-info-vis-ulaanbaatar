import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import PreviewPlane from './PreviewPlane';

export const StationSettings = {
    elevationOffset: 1,
}

export default class Station {
    constructor(scene, events, name, filename, x, z, settings = StationSettings) {
        this.scene = scene;
        this.events = events;
        this.settings = settings;

        this.name = name;
        this.filename = filename;
        this.x = x;
        this.z = z;

        this.color = new THREE.Color(0, 1, 0);

        this.init();
        this.bindEvents();
    }

    init() {
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshBasicMaterial({ color: this.color });
        this.cube = new THREE.Mesh(this.geometry, this.material);
        this.cube.position.set(this.x, this.settings.elevationOffset, this.z);

        this.previewPlane = new PreviewPlane(this.cube, this.events, this.name, this.filename);

        this.scene.add(this.cube);
    }

    bindEvents() {
        this.events.bind(this.cube, 'mousedown', () => this.onClick());
        window.newAppState.activeStation.subscribe(station => this.onActiveStationChange(station));
    }

    onClick() {
        window.newAppState.activeStation.notify(this.name);
    }

    setScale(scale) {
        this.cube.scale.set(scale, scale, scale);
    }

    onActiveStationChange(station) {
        if (station === this.name) {
            this.cube.material.color.setRGB(255, 0, 0);
        } else {
            this.cube.material.color.setRGB(255, 255, 255);
        }
    }

    setVisible(visible) {
        this.cube.visible = visible;
    }

    tweenToPosition(newX, newY, newZ) {
        const stationPosition = this.cube.position;
        const targetPosition = { x: newX, y: newY, z: newZ };
        const moveTween = new TWEEN.Tween(stationPosition)
            .to(targetPosition, 250)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                this.cube.position.set(stationPosition.x, stationPosition.y, stationPosition.z);
            })
            .start();
    }
}
