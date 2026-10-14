// OMI AnimationWorklet — Canvas D (experimental)
registerAnimator('omi-animator', class {
  constructor() { this.phase = 0; }
  animate(currentTime, effect) {
    this.phase = (this.phase + 0.01) % 1;
    if (effect) effect.localTime = this.phase * 1000;
  }
});
