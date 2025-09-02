import * as THREE from 'three';

export abstract class SceneBase {
  protected camera: THREE.PerspectiveCamera;
  protected threeScene: THREE.Scene;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.threeScene = new THREE.Scene();
  }

  abstract init(): void;
  abstract update(dt: number): void;
  abstract dispose(): void;

  onResize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  getCamera() { return this.camera; }
  getThreeScene() { return this.threeScene; }
}


