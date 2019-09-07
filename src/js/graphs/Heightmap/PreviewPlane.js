import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js'

export const PreviewPlaneSettings = {
    width: 5,
    height: 5,
}

export default class PreviewPlane {
    constructor(parent, events, name, filename, settings = PreviewPlaneSettings) {
        this.parent = parent;
        this.events = events;
        this.name = name;
        this.filename = filename;
        this.settings = settings;

        this.init();
        this.bindEvents();
    }

    init() {
        const { width, height } = this.settings;
        this.geometry = new THREE.BoxGeometry(
            width, height, 0.02,
            1, 1, 1,
        );

        this.material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            alphaTest: 0.5,
        });

        this.plane = new THREE.Mesh(this.geometry, this.material);
        this.plane.position.set(0, 1, 0);
        this.plane.rotation.x = -Math.PI / 2;
        this.plane.visible = false;
        this.parent.add(this.plane);
    }

    bindEvents() {
        this.events.bind(this.plane, 'mousedown', () => this.onClick());
        window.newAppState.activeStation.subscribe(station => this.onActiveStationChange(station));
    }

    // eslint-disable-next-line class-methods-use-this
    onClick() {
        window.newAppState.activeStation.notify(null)
    }

    onActiveStationChange(station) {
        if (this.name === station) {
            this.show();
        } else {
            this.hide();
        }
    }

    show() {
        const textureUrl = `/public/${this.filename}_2048.jpg`;
        const textureLoader = new THREE.TextureLoader();
        console.log('will load texture on ', this.filename);
        textureLoader.load(textureUrl, (texture) => {
            console.log('texture loaded on ', this.filename);
            this.texture = texture;
            this.material.map = texture;
            this.material.needsUpdate = true;
            this.plane.visible = true;
            this.textureTween = new TWEEN.Tween(this.material)
                .to({ opacity: 1 }, 500)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
        });
    }

    hide() {
        this.textureTween = new TWEEN.Tween(this.material)
        .to({ opacity: 0 }, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(() => {
            if (this.texture) this.texture.dispose();
            this.plane.visible = false;
            this.material.map = null;
            this.material.needsUpdate = true;
        })
        .start();
    }
}
