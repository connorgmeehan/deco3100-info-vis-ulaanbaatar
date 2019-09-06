import * as THREE from 'three';
import { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } from 'constants';

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

    constructor(parent, events, name, val, settings = PollutionBlobSettings) {
        this.parent = parent;
        this.events = events;
        this.name = name;
        this.val = val;
        this.settings = settings;

        this.init();
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

    setPosition(x, y, z) {
        this.mesh.position.set(x, y, z);
    }

    setOpacity(opacity) {
        this.material.opacity = opacity;
    }
    setScale(scale) {
        this.mesh.scale.set(scale, scale, scale);
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
}