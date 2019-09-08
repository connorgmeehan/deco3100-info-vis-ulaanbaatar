import * as THREE from 'three';
import TextSprite from 'three.textsprite';
import TWEEN from '@tweenjs/tween.js';

export const SegmentTextDiskSettings = {
    height: 2,
    radius: 28,
    radiusSegments: 50,
    hoverOpacity: 0.25,
    textSize: 1.5,
    color: new THREE.Color(255, 255, 255),
}

export default class SegmentTextDisk {
    constructor(parent, events, utc, text, settings = SegmentTextDiskSettings) {
        this.parent = parent;
        this.events = events;
        this.utc = utc;
        this.text = text;
        this.settings = settings;

        this.init();
    }

    init() {
        const { color } = this.settings;
        this.material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color.r, color.g, color.b),
        });
        const circleGeometry = new THREE.CircleGeometry(28, 50);
        circleGeometry.vertices.shift();
        this.circle = new THREE.LineLoop(circleGeometry, this.material);
        this.circle.rotation.x = -Math.PI / 2;
        this.parent.add(this.circle);

        this.textObj = new TextSprite({
            material: {
                color,
            },
            redrawInterval: 250,
            textSize: this.settings.textSize,
            texture: {
                fontFamily: 'Arial, Helvetica, sans-serif',
                text: this.text,
            },
        });
        const theta = 125;
        const x = Math.sin(theta) * this.settings.radius;
        const z = Math.cos(theta) * this.settings.radius;
        this.textObj.position.set(x, 0, z);
        this.defaultPosition = { x, y: 0, z };
        this.parent.add(this.textObj);
    }

    setVisible(isVisible) {
        this.circle.visible = isVisible;
        this.textObj.visible = isVisible;
    }
    setTextVisible(isVisible) {
        this.textObj.visible = isVisible;
    }
    setCircleVisible(isVisible) {
        this.circle.visible = isVisible;
    }

    setTextPositionToDefault() {
        const { x, y, z } = this.defaultPosition;
        this.animateTextPosition(x, y, z);
    }

    setTextSizeToDefault() {
        this.animateTextSize(this.settings.textSize);
    }

    animateScaleOnCircle(x, y, z) {
        if (x !== 0 || y !== 0 || z !== 0) this.circle.visible = true;
        this.circleScaleTween = new TWEEN.Tween(this.circle.scale)
            .to({ x, y, z })
            .onComplete(() => {
                if (x === 0 || y === 0 || z === 0) this.circle.visible = false;
            })
            .start();
    }

    animateTextSize(textSize) {
        this.textSizeTween = new TWEEN.Tween(this.textObj)
            .to({ textSize }, 2000)
            .start();
    }

    animateTextPosition(x, y, z) {
        this.textSizeTween = new TWEEN.Tween(this.textObj.position)
            .to({ x, y, z }, 2000)
            .start();
    }

    animateTextPositionToDefault() {
        console.log(this);
        const { x, y, z } = this.defaultPosition;
        this.animateTextPosition(x, y, z);
    }

    animateTextSizeToDefault() {
        this.animateTextSize(this.settings.textSize);
    }
}
