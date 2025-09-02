Stinkbug Racer
==============

A lightweight 3D racing prototype built with TypeScript + Vite + Three.js. Drive a stinkbug against other bugs on a track with variety and a shortcut, inspired by Beetle Adventure Racing.

Features
--------
- Keyboard, Gamepad, and Touch controls
- Scene system: Main Menu, Game, Level Editor (WIP)
- Simple track with tunnel shortcut and props
- Player controller and basic AI bugs

Scripts
-------
- `npm run dev` - Start dev server
- `npm run build` - Type-check and build
- `npm run preview` - Preview production build

Deploy
------
Works out of the box on Netlify. `netlify.toml` publishes the `dist` folder.

Controls
--------
- Keyboard: WASD/Arrows to steer and throttle, Shift for drift (placeholder), E for boost (placeholder)
- Gamepad: Left stick steer, RT accelerate, LT brake, RB drift, A boost
- Touch: Left/right steer buttons, accel/brake buttons

Structure
---------
- `src/systems/engine` - Engine loop and scene manager
- `src/systems/scenes` - Main menu, game, and editor scenes
- `src/systems/input` - Unified input handling
- `src/systems/track` - Track construction utilities
- `src/systems/vehicles` - Player and AI controllers

Roadmap
-------
- Checkpoints, laps, and timing
- Improved physics and drift/boost mechanics
- Proper AI following splines and using shortcuts
- Level editor tools (spline track authoring)
- Audio, VFX, and UI polish


