import * as THREE from 'three';

export class AIRacer {
  private object: THREE.Group;
  private speed = 6 + Math.random() * 2;
  private heading = Math.random() * Math.PI * 2;

  constructor() {
    this.object = this.createBugMesh();
  }

  getObject3D() { return this.object; }

  update(dt: number) {
    // Simple wandering AI along a circle for now
    this.heading += (Math.sin(performance.now() * 0.001 + this.speed) * 0.5) * dt;
    const forward = new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading) * -1);
    const vel = forward.multiplyScalar(this.speed * 0.4);
    this.object.position.addScaledVector(vel, dt);
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


