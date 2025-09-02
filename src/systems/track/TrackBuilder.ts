import * as THREE from 'three';

export class TrackBuilder {
  buildSampleTrack(): THREE.Group {
    const group = new THREE.Group();

    // Main loop (oval with variation)
    const path = new THREE.CurvePath<THREE.Vector3>();
    const points: THREE.Vector3[] = [];
    const radiusX = 18;
    const radiusZ = 12;
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      const x = Math.cos(a) * (radiusX + Math.sin(a * 3) * 2);
      const z = Math.sin(a) * (radiusZ + Math.cos(a * 2) * 2);
      points.push(new THREE.Vector3(x, 0, z));
    }
    // Segments
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      const line = new THREE.LineCurve3(a, b);
      path.add(line);
    }

    const roadWidth = 3.2;
    const geometry = new THREE.TubeGeometry(path, 256, roadWidth, 8, true);
    const material = new THREE.MeshStandardMaterial({ color: 0x2b2b34, metalness: 0.0, roughness: 1.0 });
    const road = new THREE.Mesh(geometry, material);
    road.rotation.x = Math.PI / 2; // make tube flat-ish look
    road.scale.set(1, 0.12, 1);
    group.add(road);

    // Shortcut tunnel
    const tunnelGeo = new THREE.CylinderGeometry(1.4, 1.4, 8, 12, 1, true);
    const tunnelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a22, side: THREE.DoubleSide });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.position.set(-10, 0.4, 0);
    tunnel.rotation.z = Math.PI / 2;
    group.add(tunnel);

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

    return group;
  }
}


