import * as THREE from 'three';

export class AIRacer {
  private object: THREE.Group;
  private speed = 6 + Math.random() * 2;
  private heading = Math.random() * Math.PI * 2;
  private waypointIndex = 0;

  constructor(private path: THREE.Vector3[]) {
    this.object = this.createBugMesh();
  }

  getObject3D() { return this.object; }

  update(dt: number) {
    if (this.path.length === 0) return;

    const target = this.path[this.waypointIndex];
    const pos = this.object.position;
    const toTarget = new THREE.Vector3().subVectors(target, pos);
    toTarget.y = 0;
    const distance = toTarget.length();
    if (distance < 0.6) {
      this.waypointIndex = (this.waypointIndex + 1) % this.path.length;
    }

    if (distance > 1e-3) {
      toTarget.normalize();
      const desiredHeading = Math.atan2(toTarget.x, -toTarget.z);
      const delta = angleDelta(this.heading, desiredHeading);
      const turnRate = 1.8; // rad/s
      this.heading += THREE.MathUtils.clamp(delta, -turnRate * dt, turnRate * dt);
    }

    const forward = new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading) * -1);
    const vel = forward.multiplyScalar(this.speed * 0.5);
    this.object.position.addScaledVector(vel, dt);
    this.object.position.y = 0.5;
    this.object.rotation.y = this.heading;
  }

  private createBugMesh(): THREE.Group {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x7b5c46 })
    );
    body.scale.set(1.2, 1.1, 1.6);
    body.position.y = 0.3;
    g.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x2d2a1a })
    );
    head.position.set(0, 0.4, -0.4);
    g.add(head);

    return g;
  }
}

function angleDelta(a: number, b: number): number {
  // Shortest signed angle difference in range [-PI, PI]
  const d = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return d;
}


