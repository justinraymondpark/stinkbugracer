import * as THREE from 'three';

export type RacerState = {
  object: THREE.Object3D;
  name: string;
  lap: number;
  nextCheckpointIndex: number;
  finished: boolean;
  progressScore: number; // used for ranking
};

export class RaceManager {
  private racers: RacerState[] = [];
  private elapsedSeconds = 0;

  constructor(private checkpoints: THREE.Vector3[], private totalLaps: number, private checkpointRadius = 3.5) {}

  registerRacer(object: THREE.Object3D, name: string): RacerState {
    const state: RacerState = {
      object,
      name,
      lap: 0,
      nextCheckpointIndex: 0,
      finished: false,
      progressScore: 0,
    };
    this.racers.push(state);
    return state;
  }

  update(deltaSeconds: number) {
    this.elapsedSeconds += deltaSeconds;

    const n = this.checkpoints.length;
    for (const r of this.racers) {
      if (r.finished) continue;

      const pos = r.object.position;
      const target = this.checkpoints[r.nextCheckpointIndex];
      if (pos.distanceToSquared(target) <= this.checkpointRadius * this.checkpointRadius) {
        r.nextCheckpointIndex = (r.nextCheckpointIndex + 1) % n;
        if (r.nextCheckpointIndex === 0) {
          r.lap += 1;
          if (r.lap >= this.totalLaps) {
            r.finished = true;
          }
        }
      }

      // Progress: laps completed + checkpoint progression + fraction towards next checkpoint
      const prevIndex = (r.nextCheckpointIndex - 1 + n) % n;
      const a = this.checkpoints[prevIndex];
      const b = this.checkpoints[r.nextCheckpointIndex];
      const ab = new THREE.Vector3().subVectors(b, a);
      const ap = new THREE.Vector3().subVectors(pos, a);
      const abLenSq = Math.max(1e-4, ab.lengthSq());
      let t = THREE.MathUtils.clamp(ab.dot(ap) / abLenSq, 0, 1);
      const perLap = n;
      r.progressScore = r.lap * perLap + prevIndex + t;
    }
  }

  getRanking(): RacerState[] {
    return [...this.racers].sort((a, b) => b.progressScore - a.progressScore);
  }

  getStateFor(object: THREE.Object3D): RacerState | undefined {
    return this.racers.find(r => r.object === object);
  }

  getElapsedSeconds() { return this.elapsedSeconds; }
  getTotalLaps() { return this.totalLaps; }
}


