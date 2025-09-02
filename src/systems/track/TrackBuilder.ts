import * as THREE from 'three';

export type BuiltTrack = {
  root: THREE.Group;
  checkpoints: THREE.Vector3[];
  waypointsMain: THREE.Vector3[];
  waypointsShortcut: THREE.Vector3[];
};

export class TrackBuilder {
  buildSampleTrack(): BuiltTrack {
    const group = new THREE.Group();

    // Main loop (oval with variation)
    const points: THREE.Vector3[] = [];
    const radiusX = 18;
    const radiusZ = 12;
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      const x = Math.cos(a) * (radiusX + Math.sin(a * 3) * 2);
      const z = Math.sin(a) * (radiusZ + Math.cos(a * 2) * 2);
      points.push(new THREE.Vector3(x, 0, z));
    }
    // Curve for sampling and road construction
    const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5);
    const roadWidth = 3.4;
    const road = this.buildRoad(curve, roadWidth, 256);
    group.add(road);

    // Shortcut tunnel
    const tunnelGeo = new THREE.CylinderGeometry(1.4, 1.4, 8, 12, 1, true);
    const tunnelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a22, side: THREE.DoubleSide });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.position.set(-10, 0.4, 0);
    tunnel.rotation.z = Math.PI / 2;
    group.add(tunnel);

    // Ramp shortcut (jump)
    const ramp = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.5, 2),
      new THREE.MeshStandardMaterial({ color: 0x3a3a48 })
    );
    ramp.position.set(8, 0.25, -4);
    ramp.rotation.z = -0.35;
    group.add(ramp);

    // Environment props
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(60, 48),
      new THREE.MeshPhongMaterial({ color: 0x0f1a12 })
    );
    floor.rotation.x = -Math.PI / 2;
    group.add(floor);

    const rng = (seed: number) => () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
    const rnd = rng(42);
    const rockGeo = new THREE.DodecahedronGeometry(0.6, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x334, roughness: 1 });
    for (let i = 0; i < 80; i++) {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const r = 45 * Math.sqrt(rnd());
      const a = rnd() * Math.PI * 2;
      rock.position.set(Math.cos(a) * r, 0.3, Math.sin(a) * r);
      rock.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
      group.add(rock);
    }

    // Waypoints & checkpoints
    const waypointsMain: THREE.Vector3[] = [];
    const samples = 128;
    for (let i = 0; i < samples; i++) {
      const t = i / samples;
      const p = curve.getPointAt(t).clone();
      p.y = 0.12;
      waypointsMain.push(p);
    }

    // Build a shortcut path that goes through the tunnel
    const shortcut = waypointsMain.map(p => p.clone());
    // Find a segment closest to tunnel center (-10, 0, 0)
    const tunnelCenter = new THREE.Vector3(-10, 0.35, 0);
    let nearestIndex = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < shortcut.length; i++) {
      const d = shortcut[i].distanceToSquared(tunnelCenter);
      if (d < nearestDist) { nearestDist = d; nearestIndex = i; }
    }
    const insertPoints = [
      new THREE.Vector3(-12, 0.35, 3),
      new THREE.Vector3(-10, 0.35, 0),
      new THREE.Vector3(-12, 0.35, -3),
    ];
    // Replace a few points around the nearest index with tunnel points
    const replaceCount = 3;
    shortcut.splice(Math.max(0, nearestIndex - 1), replaceCount, ...insertPoints);

    // Checkpoints every 4 points (~8 checkpoints around loop)
    const checkpoints: THREE.Vector3[] = [];
    for (let i = 0; i < waypointsMain.length; i += Math.floor(samples / 10)) {
      const p = waypointsMain[i].clone(); p.y = 0.35; checkpoints.push(p);
    }

    return { root: group, checkpoints, waypointsMain, waypointsShortcut: shortcut };
  }

  private buildRoad(curve: THREE.CatmullRomCurve3, halfWidth: number, segments: number): THREE.Mesh {
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const up = new THREE.Vector3(0, 1, 0);

    const lefts: THREE.Vector3[] = [];
    const rights: THREE.Vector3[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const side = new THREE.Vector3().crossVectors(up, tangent).normalize();
      const left = new THREE.Vector3().copy(p).addScaledVector(side, halfWidth);
      const right = new THREE.Vector3().copy(p).addScaledVector(side, -halfWidth);
      left.y = right.y = 0.12;
      lefts.push(left);
      rights.push(right);
    }

    for (let i = 0; i <= segments; i++) {
      const l = lefts[i];
      const r = rights[i];
      positions.push(l.x, l.y, l.z, r.x, r.y, r.z);
      normals.push(0, 1, 0, 0, 1, 0);
      uvs.push(0, i / segments, 1, i / segments);
    }

    for (let i = 0; i < segments; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, b, c, b, d, c);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeBoundingSphere();

    const mat = new THREE.MeshStandardMaterial({ color: 0x2b2b34, roughness: 1.0, metalness: 0.0, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = false;
    mesh.castShadow = false;
    return mesh;
  }
}


