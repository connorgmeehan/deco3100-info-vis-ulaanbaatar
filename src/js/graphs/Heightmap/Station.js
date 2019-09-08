import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import TextSprite from 'three.textsprite';
import PreviewPlane from './PreviewPlane';

export const StationSettings = {
    elevationOffset: 1,
    textSize: 5,
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

        this.textObj = new TextSprite({
            material: {
                color: this.color,
            },
            redrawInterval: 250,
            textSize: 0,
            texture: {
                fontFamily: 'Arial, Helvetica, sans-serif',
                text: this.name,
            },
        });

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
    animateScale(x, y, z) {
        if (x !== 0 || y !== 0 || z !== 0) this.cube.visible = true;
        this.scaleTween = new TWEEN.Tween(this.cube.scale)
            .to({ x, y, z })
            .onComplete(() => {
                if (x === y === z === 0) this.plane.visible = false;
            })
            .start();      
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

    showText(visible) {
        console.log(`Station:showText(visible: ${visible}) on ${this.name}`);
        if (visible) this.textObj.visible = visible;
        this.textSizeTween = new TWEEN.Tween(this.textObj)
            .to({ textSize: this.settings.textSize }, 200)
            .onComplete(() => {
                if (!visible) this.textObj.visible = visible
                console.log(`Station:showText(visible: ${visible}) complete ${this.name}`, this);
            })
            .start();
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
