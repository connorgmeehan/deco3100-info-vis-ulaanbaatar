import * as THREE from 'three';

import TextSprite from 'three.textsprite';

export const NorthPointerSettings = {
  origin: { x: 0, y: 2, z: 0 },
  sceneRadius: 28,
  realRadius: 22000,
  screenRadius: 0.185208333,
  northDirection: { x: 0, y: 0, z: -1 },
  segmentCount: 50,
  color: 0xFF0000,
  lineSize: 0.1,
};

class NorthPointer {
  constructor(scene, camera, northPointerSettings) {
    this.scene = scene;
    this.camera = camera;
    this.origin = northPointerSettings.origin;
    this.sceneRadius = northPointerSettings.sceneRadius;
    this.realRadius = northPointerSettings.realRadius;
    this.screenRadius = northPointerSettings.screenRadius;
    this.ratio = Math.round(this.realRadius / this.screenRadius);

    this.circleGeometry = new THREE.CircleGeometry(this.sceneRadius, northPointerSettings.segmentCount);
    this.circleGeometry.vertices.shift();
    this.material = new THREE.LineBasicMaterial({ color: northPointerSettings.color });
    this.circle = new THREE.LineLoop(this.circleGeometry, this.material);
    this.circle.position.set(this.origin.x, this.origin.y, this.origin.z);
    this.circle.rotation.x = -Math.PI / 2;
    this.scene.add(this.circle);

    this.lineGeometry = new THREE.Geometry();
    this.lineGeometry.vertices.push(
      new THREE.Vector3(0, 0, -this.sceneRadius * (1 - northPointerSettings.lineSize)),
      new THREE.Vector3(0, 0, -this.sceneRadius * (1 + northPointerSettings.lineSize)),
    );
    this.northLine = new THREE.Line(this.lineGeometry, this.material);
    this.northLine.position.set(this.origin.x, this.origin.y, this.origin.z);
    this.scene.add(this.northLine)

    this.northFigureGeometry = new THREE.Geometry();
    this.northFigureGeometry.vertices.push(
      new THREE.Vector3(-0.25, 0, -this.sceneRadius * (1.1 + northPointerSettings.lineSize) - 0),
      new THREE.Vector3(-0.25, 0, -this.sceneRadius * (1.1 + northPointerSettings.lineSize) - 1),
      new THREE.Vector3(0.25, 0, -this.sceneRadius * (1.1 + northPointerSettings.lineSize) - 0),
      new THREE.Vector3(0.25, 0, -this.sceneRadius * (1.1 + northPointerSettings.lineSize) - 1),
    );
    this.northFigure = new THREE.Line(this.northFigureGeometry, this.material)
    this.northFigure.position.set(this.origin.x, this.origin.y, this.origin.z);
    this.scene.add(this.northFigure);

    this.ratioText = new TextSprite({
      material: {
        color: 0xffffff,
        // transparent: true,
      },
      redrawInterval: 250,
      textSize: 1.2,
      texture: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        text: `
        radius: ${this.realRadius / 1000}km
        ratio: 1:${this.ratio}`,
      },
    });
    this.ratioText.position.set(
      this.origin.x,
      this.origin.y + 4,
      this.origin.z - this.sceneRadius * (1.1 + northPointerSettings.lineSize) - 1,
    );

    this.scene.add(this.ratioText);
  }
}

export default NorthPointer;
