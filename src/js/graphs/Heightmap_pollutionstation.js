import * as THREE from 'three';

export const PollutionStationOptions = {
  position: { x: -1, y: -1, },
  name: 'Unnamed',
};

class PollutionStation {
  scene;
  name;
  data;
  position = { x: -1, y: -1 z: -1 };

  

  constructor(scene, data, psOptions) {
    this.scene = scene;
    this.data = data;
    this.position = psOptions.position;
    this.name = psOptions.name;

    
  }

  onScroll(scrollOffset, progress) {
    this.update(progress);
  }
}

export default PollutionStation;
