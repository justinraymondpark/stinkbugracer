## v0.0.2

- Fix import path in `GameScene.ts`
- Correct closing tag in `index.html`
- Add README and .gitignore
- Add @types/three and successful build

## v0.0.3

- Add `RaceManager` with checkpoints, laps, and ranking
- Expand `TrackBuilder` with ramp shortcut and waypoints for AI
- Update `AIRacer` to follow waypoints; some bots prefer shortcut
- Integrate race HUD updates in `GameScene`
 - Fix AI turning math (replace missing angleDifference)

## v0.0.4

- Player drift and boost mechanics
- Checkpoint gate markers with active highlight
- AI cornering speed adjustment

## v0.0.5

- Add AudioManager: engine tone, drift noise, boost whoosh
- Add VFXManager: dust and boost particles
- Hook audio+VFX into GameScene and player status

## v0.0.1

- Initial scaffold with Vite + TypeScript + Three.js
- Engine loop and scene manager
- Scenes: Main Menu, Game, Level Editor (WIP)
- Input: keyboard, gamepad, touch buttons
- Track: loop with a tunnel shortcut and props
- Vehicles: player stinkbug controller and simple AI racers
- Netlify config and base styles


