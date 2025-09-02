import * as THREE from 'three';
import { InputSystem } from '../input/InputSystem';

export class StinkbugController {
  private object: THREE.Group;
  private velocity = new THREE.Vector3();
  private heading = 0; // radians
  private speed = 0;

  constructor(private input: InputSystem) {
    this.object = this.createBugMesh();
  }

  getObject3D() { return this.object; }

  update(dt: number) {
    const state = this.input.getState();

    // Simple arcade car-like physics
    const maxSpeed = 12;
    const accel = 18 * state.accelerate;
    const brake = 20 * state.brake;
    const drag = 2.2;
    const steerRate = 2.4; // rad/s at speed 1

    // Update speed
    this.speed += (accel - brake) * dt;
    this.speed -= this.speed * drag * dt;
    this.speed = Math.max(0, Math.min(maxSpeed, this.speed));

    // Steering scales with speed
    const steer = state.steer * steerRate * (0.2 + 0.8 * (this.speed / maxSpeed));
    this.heading += steer * dt;

    // Update position
    const forward = new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading) * -1);
    this.velocity.copy(forward).multiplyScalar(this.speed);
    this.object.position.addScaledVector(this.velocity, dt);
    this.object.rotation.y = this.heading;
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


