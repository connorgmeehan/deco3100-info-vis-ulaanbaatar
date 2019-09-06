import * as THREE from 'three';

import TextSprite from 'three.textsprite';

export const TemperatureDiskSettings = {
    tempRange: {
        min: -30,
        max: 24.18,
    },
    range: {
        min: 0.5,
        max: 1.0,
    },
    height: 2,
    radius: 25,
    radiusSegments: 16,
    hoverOpacity: 0.25,
}

export default class TemperatureDisk {
    constructor(scene, parent, events, utc, temperature, settings = TemperatureDiskSettings) {
        this.scene = scene;
        this.parent = parent;
        this.events = events;
        this.utc = utc;
        this.temperature = temperature;
        this.settings = settings;

        this.init();
    }

    init() {
        const tempDifference = Math.abs(this.settings.tempRange.max - this.settings.tempRange.min);
        const scaledTemperature = (this.temperature + Math.abs(0 - this.settings.tempRange.min)) / tempDifference;
        const { min, max } = this.settings.range;
        const hue = scaledTemperature * (max - min) + min;
        const color = new THREE.Color().setHSL(hue, 0.6, 0.6);
        this.material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color.r, color.g, color.b),
            opacity: 0.0,
            transparent: true,
            alphaTest: 0.2,
            side: THREE.DoubleSide,
        });

        this.text = new TextSprite({
            material: {
                color,
            },
            redrawInterval: 250,
            textSize: 1.5,
            texture: {
                fontFamily: 'Arial, Helvetica, sans-serif',
                text: `${Math.round(this.temperature * 10) / 10}℃`,
            },
        });
        const theta = 45;
        const x = Math.sin(theta) * this.settings.radius;
        const z = Math.cos(theta) * this.settings.radius;
        this.text.position.set(x, 0, z);
        this.parent.add(this.text);
    }

    setVisible(isVisible) {
        this.text.visible = isVisible;
    }
}
