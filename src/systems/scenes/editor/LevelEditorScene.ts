import * as THREE from 'three';
import { Engine } from '../../engine/Engine';
import { SceneManager } from '../../engine/SceneManager';
import { SceneBase } from '../../engine/Scene';

export class LevelEditorScene extends SceneBase {
  private overlay: HTMLDivElement | null = null;

  constructor(private engine: Engine, private sceneManager: SceneManager) {
    super();
  }

  init(): void {
    this.threeScene.background = new THREE.Color(0x101018);
    const grid = new THREE.GridHelper(200, 200, 0x444444, 0x222222);
    this.threeScene.add(grid);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    this.threeScene.add(light);

    this.camera.position.set(6, 8, 10);
    this.camera.lookAt(0, 0, 0);

    const root = this.sceneManager.getOverlayRoot();
    this.overlay = document.createElement('div');
    this.overlay.className = 'menu';
    this.overlay.innerHTML = `
      <h1>Level Editor (WIP)</h1>
      <button id="btn-back">Back to Menu</button>
    `;
    root.appendChild(this.overlay);

    this.overlay.querySelector<HTMLButtonElement>('#btn-back')?.addEventListener('click', () => {
      history.go(0); // simple return by reloading to main scene bootstrap
    });
  }

  update(dt: number): void {}

  dispose(): void {
    if (this.overlay && this.overlay.parentElement) this.overlay.parentElement.removeChild(this.overlay);
  }
}


