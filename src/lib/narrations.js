/**
 * Narration — singleton-style HTML5 Audio wrapper for narration playback.
 * Usage:
 *   import { narration } from '~/lib/narrations.js';
 *   narration.play('/audio/narration_p1.mp3');
 *   narration.stop();
 *   narration.subscribe(state => updateUI(state));
 */

class NarrationPlayer {
  constructor() {
    this._audio = null;
    this._currentSrc = null;
    this._timer = null;
    this._subscribers = new Set();
  }

  subscribe(cb) {
    this._subscribers.add(cb);
    cb(this.state());
    return () => this._subscribers.delete(cb);
  }

  state() {
    const a = this._audio;
    return {
      src: this._currentSrc,
      playing: !!(a && !a.paused && !a.ended),
      currentTime: a ? a.currentTime : 0,
      duration: a ? (isFinite(a.duration) ? a.duration : 0) : 0,
      progress: a && a.duration ? a.currentTime / a.duration : 0,
    };
  }

  _emit() {
    const s = this.state();
    for (const cb of this._subscribers) cb(s);
  }

  play(src) {
    if (!src) return;
    if (this._currentSrc === src && this._audio && !this._audio.ended) {
      // toggle play/pause if same source
      if (this._audio.paused) this._audio.play().catch(() => {});
      else this._audio.pause();
      this._emit();
      return;
    }
    this.stop();
    this._currentSrc = src;
    this._audio = new Audio(src);
    this._audio.addEventListener('ended', () => this._emit());
    this._audio.addEventListener('pause', () => this._emit());
    this._audio.addEventListener('play',  () => this._emit());
    this._audio.addEventListener('error', () => { console.warn('[narration] failed:', src); this._emit(); });
    const p = this._audio.play();
    if (p && p.catch) p.catch(err => console.warn('[narration] blocked:', err));
    if (this._timer) clearInterval(this._timer);
    this._timer = setInterval(() => this._emit(), 200);
    this._emit();
  }

  pause() {
    if (this._audio && !this._audio.paused) this._audio.pause();
    this._emit();
  }

  resume() {
    if (this._audio && this._audio.paused) {
      this._audio.play().catch(() => {});
      this._emit();
    }
  }

  toggle(src) {
    if (this._currentSrc === src && this._audio) {
      if (this._audio.paused) this.resume();
      else this.pause();
    } else {
      this.play(src);
    }
  }

  stop() {
    if (this._audio) { this._audio.pause(); this._audio.currentTime = 0; this._audio = null; }
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    this._currentSrc = null;
    this._emit();
  }
}

// Shared singleton — survives page transitions when used inside view-transition root.
export const narration = new NarrationPlayer();

if (typeof window !== 'undefined') {
  // Stop on tab hide so audio doesn't keep going in background.
  window.addEventListener('visibilitychange', () => {
    if (document.hidden && narration.state().playing) narration.pause();
  });
}
