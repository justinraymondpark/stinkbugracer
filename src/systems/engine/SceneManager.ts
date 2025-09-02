import { SceneBase } from './Scene';

export class SceneManager {
  private active?: SceneBase;

  constructor(private overlayRoot: HTMLElement) {}

  getOverlayRoot() { return this.overlayRoot; }

  changeScene(next: SceneBase) {
    this.active?.dispose();
    this.active = next;
    this.active.init();
  }

  getActive() { return this.active; }
}


