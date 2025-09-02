import * as THREE from 'three';
import { SceneManager } from './SceneManager';

export class Engine {
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private running = false;

  constructor(private canvas: HTMLCanvasElement, private sceneManager: SceneManager) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.clock = new THREE.Clock();

    window.addEventListener('resize', () => this.onResize());
  }

  getRenderer() { return this.renderer; }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.loop();
  }

  stop() {
    this.running = false;
  }

  private loop = () => {
    if (!this.running) return;
    requestAnimationFrame(this.loop);
    const delta = this.clock.getDelta();
    const scene = this.sceneManager.getActive();
    scene?.update(delta);
    if (scene) {
      const camera = scene.getCamera();
      const threeScene = scene.getThreeScene();
      this.renderer.render(threeScene, camera);
    }
  };

  private onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const scene = this.sceneManager.getActive();
    scene?.onResize(window.innerWidth, window.innerHeight);
  }
}


