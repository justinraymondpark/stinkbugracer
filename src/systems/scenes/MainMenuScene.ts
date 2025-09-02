import * as THREE from 'three';
import { Engine } from '../engine/Engine';
import { SceneManager } from '../engine/SceneManager';
import { SceneBase } from '../engine/Scene';
import { GameScene } from './game/GameScene';
import { LevelEditorScene } from './editor/LevelEditorScene';

export class MainMenuScene extends SceneBase {
  private overlay: HTMLDivElement | null = null;

  constructor(private engine: Engine, private sceneManager: SceneManager) {
    super();
  }

  init(): void {
    // Simple background
    this.threeScene.background = new THREE.Color(0x0b0b12);
    const light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(5, 10, 5);
    this.threeScene.add(light);

    // Camera gentle tilt
    this.camera.position.set(0, 3, 6);
    this.camera.lookAt(0, 1.5, 0);

    // Overlay UI
    const root = this.sceneManager.getOverlayRoot();
    this.overlay = document.createElement('div');
    this.overlay.className = 'menu';
    this.overlay.innerHTML = `
      <h1>Stinkbug Racer</h1>
      <button id="btn-start">Start Race</button>
      <button id="btn-debug">Debug Menu</button>
      <button id="btn-editor">Level Editor</button>
    `;
    root.appendChild(this.overlay);

    this.overlay.querySelector<HTMLButtonElement>('#btn-start')?.addEventListener('click', () => {
      this.sceneManager.changeScene(new GameScene(this.engine, this.sceneManager));
    });
    this.overlay.querySelector<HTMLButtonElement>('#btn-editor')?.addEventListener('click', () => {
      this.sceneManager.changeScene(new LevelEditorScene(this.engine, this.sceneManager));
    });
    this.overlay.querySelector<HTMLButtonElement>('#btn-debug')?.addEventListener('click', () => {
      alert('Debug menu coming soon');
    });
  }

  update(dt: number): void {
    // Subtle camera motion for life
    const t = performance.now() * 0.001;
    this.camera.position.x = Math.sin(t * 0.2) * 0.5;
    this.camera.lookAt(0, 1.5, 0);
  }

  dispose(): void {
    if (this.overlay && this.overlay.parentElement) {
      this.overlay.parentElement.removeChild(this.overlay);
      this.overlay = null;
    }
  }
}


