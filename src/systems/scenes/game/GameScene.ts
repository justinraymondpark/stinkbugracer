import * as THREE from 'three';
import { Engine } from '../../engine/Engine';
import { SceneManager } from '../../engine/SceneManager';
import { SceneBase } from '../../engine/Scene';
import { InputSystem } from '../../input/InputSystem';
import { TrackBuilder } from '../../track/TrackBuilder';
import { StinkbugController } from '../../vehicles/StinkbugController';
import { AIRacer } from '../../vehicles/AIRacer';

export class GameScene extends SceneBase {
  private world: THREE.Group = new THREE.Group();
  private input!: InputSystem;
  private player!: StinkbugController;
  private ai: AIRacer[] = [];
  private hud: HTMLDivElement | null = null;

  constructor(private engine: Engine, private sceneManager: SceneManager) {
    super();
  }

  init(): void {
    this.threeScene.background = new THREE.Color(0x0b0e1a);
    const hemi = new THREE.HemisphereLight(0x88bbff, 0x223344, 0.8);
    this.threeScene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(10, 20, 10);
    this.threeScene.add(dir);

    this.threeScene.add(this.world);

    // Build an interesting track with a shortcut
    const track = new TrackBuilder().buildSampleTrack();
    this.world.add(track);

    // Player + AI
    this.input = new InputSystem();
    this.player = new StinkbugController(this.input);
    this.player.getObject3D().position.set(0, 0.5, 0);
    this.world.add(this.player.getObject3D());

    for (let i = 0; i < 4; i++) {
      const bot = new AIRacer();
      bot.getObject3D().position.set(0.5 * (i + 1), 0.5, -2 - i);
      this.ai.push(bot);
      this.world.add(bot.getObject3D());
    }

    // Camera follow
    this.camera.position.set(0, 2.2, 4.5);

    // HUD
    const root = this.sceneManager.getOverlayRoot();
    this.hud = document.createElement('div');
    this.hud.className = 'hud';
    this.hud.innerText = 'Lap 1/3  Time 0:00.0';
    root.appendChild(this.hud);
  }

  update(dt: number): void {
    this.input.update();
    this.player.update(dt);
    this.ai.forEach(a => a.update(dt));

    // Simple camera follow
    const target = this.player.getObject3D().position.clone();
    const behind = new THREE.Vector3(0, 2.0, 5.5);
    const m = new THREE.Matrix4();
    m.extractRotation(this.player.getObject3D().matrixWorld);
    behind.applyMatrix4(m);
    const desired = target.clone().add(behind);
    this.camera.position.lerp(desired, 0.08);
    this.camera.lookAt(target.x, target.y + 0.5, target.z);
  }

  dispose(): void {
    if (this.hud && this.hud.parentElement) this.hud.parentElement.removeChild(this.hud);
  }
}


