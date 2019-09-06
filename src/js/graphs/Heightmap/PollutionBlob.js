import * as THREE from 'three';

const WIDTH_SEGMENTS = 8;
const HEIGHT_SEGMENTS = 8;

export const PollutionBlobSettings = {
    maxPollution: 500,
    scale: 10,
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
        const colors = this.calculateColor();
        const radius = this.calculateRadius();
        this.geometry = new THREE.SphereGeometry(radius, WIDTH_SEGMENTS, HEIGHT_SEGMENTS);
        this.material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(colors.r, colors.g, colors.b),
          opacity: 1.0,
          transparent: true,
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.parent.add(this.mesh);
    }

    setPosition(x, y, z) {
        this.mesh.position.set(x, y, z);
    }

    calculateRadius = () => this.val / ((4 / 3) * Math.PI) / this.settings.maxPollution;
    calculateColor = (darkenAmount = 0) => {
        const r = this.val / this.settings.maxPollution * 0.5 - darkenAmount;
        const g = this.val / this.settings.maxPollution * darkenAmount;
        const b = this.val / this.settings.maxPollution * darkenAmount;
        return { r, g, b };
    }
}
