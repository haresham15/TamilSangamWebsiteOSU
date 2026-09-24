"use client";

export interface TextureStatus {
  "silhouette-hero": boolean;
  "crowd-near": boolean;
  "crowd-mid": boolean;
  "crowd-far": boolean;
}

export interface DebugState {
  progress: number;
  textures: TextureStatus;
  crowdInstances: number;
  finaleFired: boolean;
  triggerFinaleFn: (() => void) | null;
}

type Listener = () => void;

class DebugStore {
  private state: DebugState = {
    progress: 0,
    textures: {
      "silhouette-hero": false,
      "crowd-near": false,
      "crowd-mid": false,
      "crowd-far": false,
    },
    crowdInstances: 0,
    finaleFired: false,
    triggerFinaleFn: null,
  };

  private listeners = new Set<Listener>();

  getState(): DebugState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  setProgress(p: number) {
    if (Math.abs(this.state.progress - p) > 0.002) {
      this.state.progress = p;
      this.notify();
    }
  }

  setTextureLoaded(key: keyof TextureStatus, loaded: boolean) {
    if (this.state.textures[key] !== loaded) {
      this.state.textures = { ...this.state.textures, [key]: loaded };
      this.notify();
    }
  }

  setCrowdInstances(count: number) {
    if (this.state.crowdInstances !== count) {
      this.state.crowdInstances = count;
      this.notify();
    }
  }

  setFinaleFired(fired: boolean) {
    if (this.state.finaleFired !== fired) {
      this.state.finaleFired = fired;
      this.notify();
    }
  }

  registerFinaleTrigger(fn: () => void) {
    this.state.triggerFinaleFn = fn;
    this.notify();
  }

  triggerFinale() {
    if (this.state.triggerFinaleFn) {
      this.state.triggerFinaleFn();
    } else {
      console.warn("[DebugStore] No finale trigger registered");
    }
  }
}

const globalRef = (typeof window !== "undefined" ? window : globalThis) as unknown as { __debugStore?: DebugStore };
if (!globalRef.__debugStore) {
  globalRef.__debugStore = new DebugStore();
}

export const debugStore = globalRef.__debugStore;
