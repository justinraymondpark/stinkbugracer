export type InputState = {
  accelerate: number; // 0..1
  brake: number; // 0..1
  steer: number; // -1..1
  drift: boolean;
  boost: boolean;
};

export class InputSystem {
  private keys = new Set<string>();
  private state: InputState = { accelerate: 0, brake: 0, steer: 0, drift: false, boost: false };
  private gamepadIndex: number | null = null;
  private touchState = { left: 0, right: 0, accel: 0, brake: 0 };

  constructor() {
    window.addEventListener('keydown', e => this.keys.add(e.key.toLowerCase()));
    window.addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));

    window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
      this.gamepadIndex = e.gamepad.index;
    });
    window.addEventListener('gamepaddisconnected', () => {
      this.gamepadIndex = null;
    });

    // Basic touch overlay (left steer, right accel/brake)
    this.setupTouch();
  }

  update() {
    // Keyboard
    const accelerateKey = this.keys.has('w') || this.keys.has('arrowup');
    const brakeKey = this.keys.has('s') || this.keys.has('arrowdown');
    const leftKey = this.keys.has('a') || this.keys.has('arrowleft');
    const rightKey = this.keys.has('d') || this.keys.has('arrowright');
    const driftKey = this.keys.has('shift');
    const boostKey = this.keys.has('e');

    let steer = 0;
    if (leftKey) steer -= 1;
    if (rightKey) steer += 1;

    this.state.accelerate = accelerateKey ? 1 : 0;
    this.state.brake = brakeKey ? 1 : 0;
    this.state.steer = steer;
    this.state.drift = driftKey;
    this.state.boost = boostKey;

    // Gamepad
    if (this.gamepadIndex !== null) {
      const gp = navigator.getGamepads()[this.gamepadIndex];
      if (gp) {
        const axLH = gp.axes[0] ?? 0;
        const rt = gp.buttons[7]?.value ?? 0; // accelerate
        const lt = gp.buttons[6]?.value ?? 0; // brake
        this.state.steer = Math.abs(axLH) > 0.08 ? axLH : this.state.steer;
        this.state.accelerate = Math.max(this.state.accelerate, rt);
        this.state.brake = Math.max(this.state.brake, lt);
        this.state.drift = this.state.drift || !!gp.buttons[5]?.pressed;
        this.state.boost = this.state.boost || !!gp.buttons[0]?.pressed;
      }
    }

    // Touch
    const touchSteer = this.touchState.right - this.touchState.left;
    const touchAccel = this.touchState.accel;
    const touchBrake = this.touchState.brake;
    if (Math.abs(touchSteer) > 0) this.state.steer = touchSteer;
    if (touchAccel > 0) this.state.accelerate = Math.max(this.state.accelerate, touchAccel);
    if (touchBrake > 0) this.state.brake = Math.max(this.state.brake, touchBrake);

    return this.state;
  }

  getState() { return this.state; }

  private setupTouch() {
    const overlay = document.createElement('div');
    overlay.className = 'touch-controls';

    const left = document.createElement('div');
    left.className = 'touch-button';
    const right = document.createElement('div');
    right.className = 'touch-button';
    const accel = document.createElement('div');
    accel.className = 'touch-button';
    const brake = document.createElement('div');
    brake.className = 'touch-button';

    overlay.appendChild(left);
    overlay.appendChild(right);
    overlay.appendChild(brake);
    overlay.appendChild(accel);

    document.getElementById('overlay-root')?.appendChild(overlay);

    const press = (el: HTMLElement, on: () => void, off: () => void) => {
      const start = (e: Event) => { e.preventDefault(); on(); };
      const end = (e: Event) => { e.preventDefault(); off(); };
      el.addEventListener('touchstart', start, { passive: false });
      el.addEventListener('touchend', end, { passive: false });
      el.addEventListener('touchcancel', end, { passive: false });
    };

    press(left, () => { this.touchState.left = 1; }, () => { this.touchState.left = 0; });
    press(right, () => { this.touchState.right = 1; }, () => { this.touchState.right = 0; });
    press(accel, () => { this.touchState.accel = 1; }, () => { this.touchState.accel = 0; });
    press(brake, () => { this.touchState.brake = 1; }, () => { this.touchState.brake = 0; });
  }
}


