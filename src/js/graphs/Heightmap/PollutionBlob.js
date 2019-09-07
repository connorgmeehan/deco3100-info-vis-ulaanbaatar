import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

const WIDTH_SEGMENTS = 8;
const HEIGHT_SEGMENTS = 8;

export const PollutionBlobSettings = {
    maxPollution: 500,
    scale: 30,
    widthSegments: 8,
    heightSegments: 8,
    hoverDarkenAmount: 0.2,
};

export default class PollutionBlob {
    parent;
    events;
    name;
    val;
    settings;

    geometry;
    material;
    mesh;

    constructor(parent, events, name, val, notifyUTCCallback, settings = PollutionBlobSettings) {
        this.parent = parent;
        this.events = events;
        this.name = name;
        this.val = val;
        this.notifyUTCCallback = notifyUTCCallback;
        this.settings = settings;

        this.init();
        this.bindEvents();
    }

    init() {
        const color = this.calculateColor();
        const radius = this.calculateRadius();
        this.geometry = new THREE.SphereGeometry(radius, WIDTH_SEGMENTS, HEIGHT_SEGMENTS);
        this.material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(color.r, color.g, color.b),
          opacity: 1.0,
          transparent: true,
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.parent.add(this.mesh);
    }

    bindEvents() {
        this.events.bind(this.mesh, 'mouseover', () => this.onMouseOver())
        this.events.bind(this.mesh, 'mouseout', () => this.onMouseOut())
    }

    setPosition(x, y, z) {
        this.mesh.position.set(x, y, z);
    }

    setOpacity(opacity) {
        this.material.opacity = opacity
    }

    setVisible(isVisible) {
        this.mesh.visible = isVisible;
    }

    calculateRadius() {
        return (
            this.val !== null
            ? (this.val / ((4 / 3) * Math.PI) / this.settings.maxPollution) * this.settings.scale
            : 0.000001
        );
    }
    calculateColor(darkenAmount = 0) {
        const r = this.val / this.settings.maxPollution * 0.5 - darkenAmount;
        const g = this.val / this.settings.maxPollution * darkenAmount;
        const b = this.val / this.settings.maxPollution * darkenAmount;
        return { r, g, b };
    }

    onMouseOver() {
        window.newAppState.selectedPollution.notify(this.val);
        window.newAppState.selectedStation.notify(this.name);
        this.notifyUTCCallback(true);

        const color = this.calculateColor(0.2);
        this.mesh.material.color = new THREE.Color(color.r, color.g, color.b);
    }

    onMouseOut() {
        window.newAppState.selectedStation.notify(this.name);
        window.newAppState.selectedPollution.notify(null);
        this.notifyUTCCallback(false);

        const color = this.calculateColor(0);
        this.mesh.material.color = new THREE.Color(color.r, color.g, color.b);
    }
}
