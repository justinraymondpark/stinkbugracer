import * as THREE from 'three';

export class TrackGates {
  public group = new THREE.Group();
  private gates: THREE.Mesh[] = [];

  constructor(points: THREE.Vector3[]) {
    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x88ff88 });
    const barGeo = new THREE.BoxGeometry(1.8, 0.08, 0.08);
    const barMat = new THREE.MeshStandardMaterial({ color: 0x44aa44 });

    for (const p of points) {
      const gate = new THREE.Group();

      const left = new THREE.Mesh(postGeo, postMat);
      left.position.set(-1, 1, 0);
      const right = new THREE.Mesh(postGeo, postMat);
      right.position.set(1, 1, 0);
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(0, 1.5, 0);

      gate.add(left, right, bar);
      gate.position.copy(p.clone().setY(0));
      this.group.add(gate);

      this.gates.push(bar);
    }
  }

  highlight(index: number) {
    for (let i = 0; i < this.gates.length; i++) {
      const mesh = this.gates[i];
      const m = mesh.material as THREE.MeshStandardMaterial;
      if (i === index) {
        m.emissive = new THREE.Color(0x22ff22);
        m.emissiveIntensity = 0.7;
      } else {
        m.emissive = new THREE.Color(0x000000);
        m.emissiveIntensity = 0;
      }
    }
  }
}


