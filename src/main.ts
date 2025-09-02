import { Engine } from './systems/engine/Engine';
import { SceneManager } from './systems/engine/SceneManager';
import { MainMenuScene } from './systems/scenes/MainMenuScene';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const overlayRoot = document.getElementById('overlay-root') as HTMLDivElement;

const sceneManager = new SceneManager(overlayRoot);
const engine = new Engine(canvas, sceneManager);

// Boot to main menu
sceneManager.changeScene(new MainMenuScene(engine, sceneManager));
engine.start();


