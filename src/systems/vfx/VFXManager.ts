import * as THREE from 'three';

export class VFXManager {
  public group = new THREE.Group();
  private particles: Particle[] = [];
  private pool: Particle[] = [];

  constructor(private scene: THREE.Scene) {
    this.scene.add(this.group);
  }

  update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.group.remove(p.mesh);
        this.pool.push(p);
        this.particles.splice(i, 1);
        continue;
      }
      p.velocity.addScaledVector(new THREE.Vector3(0, 1, 0), dt * 0.2);
      p.mesh.position.addScaledVector(p.velocity, dt);
      (p.mesh.material as THREE.MeshStandardMaterial).opacity = Math.max(0, p.life / p.maxLife) * p.opacity;
      p.mesh.rotation.y += dt * p.spin;
      p.mesh.scale.multiplyScalar(1 + dt * 0.4);
    }
  }

  spawnDust(position: THREE.Vector3, forward: THREE.Vector3, intensity: number) {
    for (let i = 0; i < Math.floor(4 * intensity); i++) {
      const p = this.getParticle();
      p.mesh.material = new THREE.MeshStandardMaterial({ color: 0x888888, transparent: true, opacity: 0.6 });
      p.mesh.scale.setScalar(0.12);
      p.mesh.position.copy(position);
      const dir = new THREE.Vector3().copy(forward).multiplyScalar(-1).addScaledVector(randomVec3(), 0.5);
      p.velocity.copy(dir).multiplyScalar(1.5 + Math.random() * 1.5);
      p.life = p.maxLife = 1.0 + Math.random() * 0.5;
      p.opacity = 0.7;
      p.spin = (Math.random() - 0.5) * 2;
      this.particles.push(p);
      this.group.add(p.mesh);
    }
  }

  spawnBoost(position: THREE.Vector3, forward: THREE.Vector3) {
    for (let i = 0; i < 12; i++) {
      const p = this.getParticle();
      p.mesh.material = new THREE.MeshStandardMaterial({ color: 0x66ccff, emissive: 0x1188ff, transparent: true, opacity: 0.9 });
      p.mesh.scale.setScalar(0.08);
      p.mesh.position.copy(position);
      const dir = new THREE.Vector3().copy(forward).addScaledVector(randomVec3(), 0.3);
      p.velocity.copy(dir).multiplyScalar(3.5 + Math.random() * 2.0);
      p.life = p.maxLife = 0.6 + Math.random() * 0.3;
      p.opacity = 1.0;
      p.spin = (Math.random() - 0.5) * 4;
      this.particles.push(p);
      this.group.add(p.mesh);
    }
  }

  private getParticle(): Particle {
    const p = this.pool.pop();
    if (p) return p;
    return {
      mesh: new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true })),
      velocity: new THREE.Vector3(),
      life: 0,
      maxLife: 1,
      opacity: 1,
      spin: 0,
    };
  }
}

type Particle = {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  opacity: number;
  spin: number;
};

function randomVec3(): THREE.Vector3 {
  return new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.3, Math.random() - 0.5).normalize();
}


