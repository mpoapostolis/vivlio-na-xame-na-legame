/**
 * KeyframePlayer — JSON-driven property animation runtime.
 *
 * Loads animation definitions (see src/data/animations.ts) and lerps properties
 * over time onto provided three.js targets. Supports dynamic bindings (camera-
 * relative positions, etc.) and per-keyframe ease functions.
 *
 * Pure ES module — no three.js import; we duck-type Vector3 via .isVector3
 * so this stays decoupled and the bundle stays small.
 */

export const EASE = {
  linear:         t => t,
  easeInQuad:     t => t * t,
  easeOutQuad:    t => 1 - (1 - t) * (1 - t),
  easeInOutQuad:  t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  easeInCubic:    t => t * t * t,
  easeOutCubic:   t => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeInQuart:    t => t * t * t * t,
  easeOutQuart:   t => 1 - Math.pow(1 - t, 4),
  easeOutBack:    t => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeOutElastic: t => {
    if (t === 0 || t === 1) return t;
    const c4 = (2 * Math.PI) / 3;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeOutBounce: t => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) { t -= 1.5 / d;  return n * t * t + 0.75; }
    if (t < 2.5 / d) { t -= 2.25 / d; return n * t * t + 0.9375; }
    t -= 2.625 / d; return n * t * t + 0.984375;
  },
};

function isVec3Array(v) {
  return Array.isArray(v) && v.length === 3 && typeof v[0] === 'number';
}

function resolveBinding(v, bindings) {
  if (typeof v !== 'string' || !v.startsWith('$')) return v;
  const key = v.slice(1);
  if (!(key in bindings)) {
    console.warn('[KeyframePlayer] missing binding $' + key);
    return 0;
  }
  const b = bindings[key];
  return typeof b === 'function' ? b() : b;
}

function lerpValue(a, b, t) {
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * t;
  if (a && a.isVector3 && b && b.isVector3) {
    // Avoid depending on THREE.Vector3 here — return a plain {x,y,z} that applyProperty handles.
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t, isVector3: true };
  }
  if (isVec3Array(a) && isVec3Array(b)) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }
  return t < 0.5 ? a : b;     // step
}

function sampleTrack(keyframes, t01, bindings) {
  if (!keyframes.length) return null;
  if (t01 <= keyframes[0].t) return resolveBinding(keyframes[0].value, bindings);
  const last = keyframes[keyframes.length - 1];
  if (t01 >= last.t) return resolveBinding(last.value, bindings);
  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i], b = keyframes[i + 1];
    if (t01 >= a.t && t01 <= b.t) {
      const localT = (t01 - a.t) / Math.max(b.t - a.t, 1e-6);
      const ease = EASE[a.ease || 'linear'] || EASE.linear;
      return lerpValue(
        resolveBinding(a.value, bindings),
        resolveBinding(b.value, bindings),
        ease(localT),
      );
    }
  }
  return resolveBinding(last.value, bindings);
}

function applyProperty(target, prop, value) {
  if (!target) return;
  if (prop === 'position') {
    if (value && value.isVector3) target.position.set(value.x, value.y, value.z);
    else if (isVec3Array(value)) target.position.set(value[0], value[1], value[2]);
  } else if (prop === 'scale') {
    if (typeof value === 'number') target.scale.setScalar(value);
    else if (isVec3Array(value)) target.scale.set(value[0], value[1], value[2]);
  } else if (prop === 'rotation') {
    if (isVec3Array(value)) target.rotation.set(value[0], value[1], value[2]);
  } else if (prop === 'opacity') {
    if (target.material) target.material.opacity = value;
  } else {
    // dotted path e.g. 'scale.x', 'material.metalness'
    const parts = prop.split('.');
    let obj = target;
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
      if (!obj) return;
    }
    obj[parts[parts.length - 1]] = value;
  }
}

export class KeyframePlayer {
  constructor(animations) {
    this.animations = animations;
    this.activeClips = [];
    this.onPlayCb = null;
    this.onTickCb = null;
  }

  play(name, opts = {}) {
    const anim = this.animations[name];
    if (!anim) { console.warn('[KeyframePlayer] unknown animation: ' + name); return null; }
    const clip = {
      name, anim,
      time: 0,
      duration: anim.duration,
      loop: opts.loop !== undefined ? opts.loop : !!anim.loop,
      targets:  opts.targets  || {},
      bindings: opts.bindings || {},
      onComplete: opts.onComplete || null,
      done: false,
    };
    this.activeClips.push(clip);
    if (this.onPlayCb) this.onPlayCb(clip);
    return clip;
  }

  stop(clip) {
    const i = this.activeClips.indexOf(clip);
    if (i >= 0) this.activeClips.splice(i, 1);
  }
  stopAll() { this.activeClips.length = 0; }

  update(dt) {
    for (let i = this.activeClips.length - 1; i >= 0; i--) {
      const clip = this.activeClips[i];
      clip.time += dt;
      if (clip.loop && clip.duration > 0) clip.time = clip.time % clip.duration;
      else if (clip.time > clip.duration) clip.time = clip.duration;

      const t01 = clip.duration > 0 ? clip.time / clip.duration : 1;
      for (const track of clip.anim.tracks) {
        const target = clip.targets[track.target];
        if (!target) continue;
        for (const prop in track.properties) {
          const value = sampleTrack(track.properties[prop], t01, clip.bindings);
          if (value !== null) applyProperty(target, prop, value);
        }
      }

      if (!clip.loop && clip.time >= clip.duration && !clip.done) {
        clip.done = true;
        if (clip.onComplete) clip.onComplete();
        this.activeClips.splice(i, 1);
      }
    }
    if (this.onTickCb) this.onTickCb(this.activeClips);
  }
}
