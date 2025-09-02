import * as THREE from 'three';
import { InputSystem } from '../input/InputSystem';

export class StinkbugController {
  private object: THREE.Group;
  private velocity = new THREE.Vector3();
  private heading = 0; // radians
  private speed = 0;
  private driftTimer = 0;
  private boostTimer = 0;
  private lastBoostTriggered = 0;

  constructor(private input: InputSystem) {
    this.object = this.createBugMesh();
  }

  getObject3D() { return this.object; }
  getStatus() {
    return {
      speed: this.speed,
      normalizedSpeed: Math.min(1, this.speed / 12),
      drifting: this.driftTimer > 0.1,
      boosting: this.boostTimer > 0,
      heading: this.heading,
      position: this.object.position.clone(),
      forward: new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading) * -1),
      justBoosted: false,
    };
  }

  update(dt: number) {
    const state = this.input.getState();

    // Simple arcade car-like physics
    const isDrifting = state.drift;
    const driftGrip = isDrifting ? 0.5 : 1.0;
    const driftSteerBonus = isDrifting ? 0.9 : 0;
    const maxSpeedBase = 12;
    const maxSpeed = maxSpeedBase * (this.boostTimer > 0 ? 1.35 : 1.0);
    const accel = 18 * state.accelerate * (this.boostTimer > 0 ? 1.25 : 1.0);
    const brake = 20 * state.brake;
    const drag = 2.2 * (isDrifting ? 0.9 : 1.0);
    const steerRate = 2.2 + driftSteerBonus; // rad/s at speed 1

    // Update speed
    this.speed += (accel - brake) * dt;
    this.speed -= this.speed * drag * dt;
    this.speed = Math.max(0, Math.min(maxSpeed, this.speed));

    // Steering scales with speed
    const steerEffect = Math.min(1, this.speed / 6); // no rotate at standstill
    const steer = state.steer * steerRate * steerEffect;
    this.heading -= steer * dt; // invert to make right steer turn right

    // Update position
    const yAxis = new THREE.Vector3(0, 1, 0);
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(yAxis, this.heading);
    const lateral = new THREE.Vector3(1, 0, 0).applyAxisAngle(yAxis, this.heading);
    this.velocity.copy(forward).multiplyScalar(this.speed);
    // Add some lateral slip while drifting (reduced at low speed)
    if (isDrifting && this.speed > 2) {
      const slip = 0.4 * (this.speed / maxSpeedBase);
      this.velocity.addScaledVector(lateral, slip);
      this.driftTimer = Math.min(2.0, this.driftTimer + dt);
    } else {
      this.driftTimer = Math.max(0, this.driftTimer - dt * 2);
    }
    this.object.position.addScaledVector(this.velocity, dt);
    this.object.rotation.y = this.heading;

    // Trigger boost if requested and recently drifted
    if (state.boost && this.driftTimer > 0.5 && this.boostTimer <= 0) {
      this.boostTimer = 1.2; // seconds of boost
      this.lastBoostTriggered = performance.now();
    }
    if (this.boostTimer > 0) {
      this.boostTimer -= dt;
    }
  }

  private createBugMesh(): THREE.Group {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x5b7c46 })
    );
    body.scale.set(1.4, 1.2, 1.8);
    body.position.y = 0.35;
    g.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x2d3a29 })
    );
    head.position.set(0, 0.45, -0.45);
    g.add(head);

    const matLeg = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.2, roughness: 0.8 });
    const legGeo = new THREE.CapsuleGeometry(0.03, 0.25, 4, 8);
    for (let i = 0; i < 6; i++) {
      const leg = new THREE.Mesh(legGeo, matLeg);
      const side = i % 2 === 0 ? -1 : 1;
      const row = Math.floor(i / 2);
      leg.position.set(0.25 * side, 0.15, -0.15 + row * 0.18);
      leg.rotation.z = side * 0.9;
      g.add(leg);
    }

    return g;
  }
}


