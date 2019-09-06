import * as THREE from 'three';

const WIDTH_SEGMENTS = 8;
const HEIGHT_SEGMENTS = 8;

export const PollutionBlobSettings = {
    maxPollution: 500,
    scale: 10,
    widthSegments: 8,
    heightSegments: 8,
};

export default class PollutionBlob {
    parent;
    val;
    geometry;
    material;
    mesh;

    constructor(parent, events, val, settings = PollutionBlobSettings) {
        this.parent = parent;
        this.events = events;
        this.val = val;
        this.settings = settings;

        this.init();
    }

    init() {
        this.geometry = new THREE.SphereGeometry(1.001, WIDTH_SEGMENTS, HEIGHT_SEGMENTS);
        this.material = new THREE.MeshBasicMaterial({
          color: 0x000000,
          opacity: 1.0,
          transparent: true,
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.obj = new THREE.Object3D();
        this.parent.add(this.mesh);
    }

    setPosition(x, y, z) {
        this.obj.position.set(x, y, z);
    }

    sety(y) {
        this.obj.position.setY(y);
    }
}
