class Time {
  constructor() {
    this.speed = 1;
    this.now = Date.now();
  }
  update() {
    this.previous = this.now;
    this.now = Date.now();
    this.realTimeDelta = this.now - this.previous;
    this.delta = this.realTimeDelta * this.speed;
  }
  /**
     Get the simulated framerate (increasing time speed
     decreases framerate and vice versa)
  */
  getFps() {
    if (!this.delta) return 0;
    return 1000 / this.delta;
  }
  /*
    Get the actual framerate (how many times a second would the
    update() function be called if the delay between the calls
    was equal to the current `this.delta` value)
   */
  getRealFps() {
    if (!this.realTimeDelta) return 0;
    return 1000 / this.realTimeDelta;
  }
}

const time = new Time();
export default time;
