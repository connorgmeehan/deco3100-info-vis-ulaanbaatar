import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import GenericGraph from './GenericGraph';
import getTextureData from '../helpers/getTextureData';

export const HeightMapConfig = {
  width: 1024,
  height: 500,
  heightmapSrc: '/public/heightmap.png',
  normalMapSrc: '/public/normalmap.png',
  textureMapSrc: '/public/texturemap.png',

  camera: {
    x: 0,
    y: 30,
    z: 40,
    viewAngle: 45,
  },
  light: {
    x: 1200,
    y: 1200,
    z: -1200,
    intensity: 0.8,
  },
}

class Heightmap extends GenericGraph {
  constructor(name, graphOptions, data, hmConfig = null) {
    super(name, graphOptions, data);

    const loader = new THREE.TextureLoader();
    const textures = {
      heightmap: null,
      normalmap: null,
      texturemap: null,
    }

    const checkTextures = () => {
      if (textures.heightmap && textures.normalmap && textures.texturemap) {
        this.init(graphOptions, textures, hmConfig);
      }
    }

    loader.load(hmConfig.heightmapSrc,
      (tex) => {
        textures.heightmap = tex;
        checkTextures();
      });
    loader.load(hmConfig.normalMapSrc,
      (tex) => {
        textures.normalmap = tex;
        checkTextures();
      });
    loader.load(hmConfig.textureMapSrc,
      (tex) => {
        textures.texturemap = tex;
        checkTextures();
      });
  }

  init(graphOptions, textures, hmConfig) {
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AmbientLight(0xeeeeee, 0.5));
    // this.cam = new THREE.OrthographicCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000)
    this.cam = new THREE.PerspectiveCamera(hmConfig.camera.viewAngle, graphOptions.dimensions.width / graphOptions.dimensions.height, 0.1, 1000);
    
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0x333333, 1.0);
    this.renderer.setSize(graphOptions.dimensions.width, graphOptions.dimensions.height);
    this.renderer.getMaxAnisotropy();

    this.light = new THREE.DirectionalLight();
    this.light.position.set(hmConfig.light.x, hmConfig.light.y, hmConfig.light.z);
    this.light.intensity = hmConfig.light.intensity;
    this.scene.add(this.light);

    this.cam.position.x = hmConfig.camera.x;
    this.cam.position.y = hmConfig.camera.y;
    this.cam.position.z = hmConfig.camera.z;
    this.cam.lookAt(this.scene.position);

    console.log(`Heightmap::constructor() -> hmConfig.imgSrc: ${hmConfig.heightmapSrc}`);

    this.createGeometryFromMap(textures);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);


    this.element.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.cam, this.renderer.domElement);

    const that = this;
    function render() {
      that.controls.update();
      that.renderer.render(that.scene, that.cam);
      requestAnimationFrame(render);
    }
    render();
  }

  createGeometryFromMap(textures) {
    const { heightmap, normalmap, texturemap } = textures;
    console.log(`Heightmap::createGeometryFromMap(image: ${heightmap}) -> width: ${heightmap.width}, height: ${heightmap.height}`);
    console.log(heightmap);
    const maxHeight = 5;


    this.planeGeometry = new THREE.PlaneGeometry(60, 60, heightmap.image.naturalWidth - 1, heightmap.image.naturalHeight - 1);

    const material = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      metalness: 0,
      roughness: 1,
      displacementMap: heightmap,
      displacementScale: maxHeight,
      // wireframe: true,
      // flatShading: true,
      normalMap: normalmap,
      map: texturemap,
    })

    // this.plane.rotation.x -= 90 * Math.PI / 180;

    this.plane = new THREE.Mesh(this.planeGeometry, material);
    this.plane.rotation.x = -Math.PI / 2;

    this.scene.add(this.plane);
  }

  render = () => {
    // controls.update();
  }

  update(progress) {
    console.log(`Heightmap::update(progress: ${progress})`);
  }
}

export default Heightmap;
