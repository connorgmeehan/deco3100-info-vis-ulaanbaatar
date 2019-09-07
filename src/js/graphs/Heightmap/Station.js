import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

export const StationSettings = {
    elevationOffset: 1,
}

export default class Station {
    constructor(scene, events, name, x, z, settings = StationSettings) {
        this.scene = scene;
        this.events = events;
        this.settings = settings;

        this.name = name;
        this.x = x;
        this.z = z;

        this.init();
    }

    init() {
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshBasicMaterial({ color: this.color });
        this.cube = new THREE.Mesh(this.geometry, this.material);
        this.cube.position.set(this.x, this.settings.elevationOffset, this.z);

        this.scene.add(this.cube);
    }

    setScale(scale) {
        console.log(`Station:setScale(${scale}) => cube scale = ${this.cube.scale}`)
        this.cube.scale.set(scale, scale, scale);
    }

    setVisible(visible) {
        this.cube.visible = visible;
    }

    tweenToPosition(newX, newY, newZ) {
        console.log('tweenToPositon', newX, newY, newZ);
        const stationPosition = this.cube.position;
        const targetPosition = { x: newX, y: newY, z: newZ };
        const moveTween = new TWEEN.Tween(stationPosition)
            .to(targetPosition, 250)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                console.log(this.name, stationPosition);
                this.cube.position.set(stationPosition.x, stationPosition.y, stationPosition.z);
            })
            .start();
    }
}
