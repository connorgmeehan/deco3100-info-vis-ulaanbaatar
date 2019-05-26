import * as THREE from 'three';

export const NorthPointerSettings = {
  origin: { x: 0, y: 2, z: 0 },
  sceneRadius: 26,
  realRadius: 22000,
  northDirection: { x: 0, y: 0, z: -1 },
  segmentCount: 50,
  color: 0xFF0000,
  lineSize: 0.1,
};

class NorthPointer {
  constructor(scene, camera, northPointerSettings, parent) {
    this.scene = scene;
    this.camera = camera;
    this.origin = northPointerSettings.origin;
    this.sceneRadius = northPointerSettings.sceneRadius;
    this.realRadius = northPointerSettings.realRadius;
    this.ratio = this.realRadius / this.sceneRadius;

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
  }

  animate() {
    console.log(this.northLine);
  }
}

export default NorthPointer;
