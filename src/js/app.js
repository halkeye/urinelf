import raf from 'raf';
import screenfull from 'screenfull';

export default class App {
  constructor() {
    this.state = {
      backgroundPositionX: 0,
      backgroundPositionY: 0
    };
    this.streamParticles = [ ];

    this.canvas = document.querySelector('.game canvas');
    this.canvas.height = this.canvas.scrollHeight;
    this.canvas.width = this.canvas.scrollWidth;
    this.crosshair = {
      radius: 10,
      x: (this.canvas.width / 2),
      y: (this.canvas.height / 2)
    };
  }

  start() {
    this.ctx = this.canvas.getContext('2d');
    this.animFrame();
    this.addEventListeners();
  }

  stop() {
    raf.cancel(this.renderLoopId);
    delete this.renderLoopId;
  }

  addEventListeners() {
    document.querySelector('#keyUp').addEventListener(
      'click',
      this.clickControl.bind(this, 'y', -1)
    );
    document.querySelector('#keyDown').addEventListener(
      'click',
      this.clickControl.bind(this, 'y', 1)
    );
    document.querySelector('#keyLeft').addEventListener(
      'click',
      this.clickControl.bind(this, 'x', -1)
    );
    document.querySelector('#keyRight').addEventListener(
      'click',
      this.clickControl.bind(this, 'x', 1)
    );

    document.querySelector('.game .close').addEventListener(
      'click',
      () => {
        screenfull.exit();
      }
    );

    if (window.DeviceOrientationEvent) {
      // Listen for the event and handle DeviceOrientationEvent object
      window.addEventListener('deviceorientation', this.devOrientHandler.bind(this), false);
    }
  }

  animFrame() {
    this.renderLoopId = raf(this.animFrame.bind(this));
    this.renderLoop();
    this.updateLoop();
  }

  renderLoop() {
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
    // Should instead xor out the previous location drawings, but easier just to clear and redraw
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.beginPath();
    this.ctx.fillStyle = 'rgb(255,255,255)';
    this.ctx.moveTo(this.crosshair.x - this.crosshair.radius, this.crosshair.y);
    this.ctx.lineTo(this.crosshair.x + this.crosshair.radius, this.crosshair.y);
    this.ctx.stroke();
    this.ctx.moveTo(this.crosshair.x, this.crosshair.y - this.crosshair.radius);
    this.ctx.lineTo(this.crosshair.x, this.crosshair.y + this.crosshair.radius);
    this.ctx.stroke();

    this.streamParticles.forEach((part) => {
      if (part.deleted) { return; }
      this.ctx.fillStyle = 'yellow';
      this.ctx.beginPath();
      this.ctx.arc(
        part.currentLocation.x,
        part.currentLocation.y,
        part.radius,
        0,
        2 * Math.PI
      );
      this.ctx.closePath();
      this.ctx.fill();

      // Nicer Particles - http://thecodeplayer.com/walkthrough/make-a-particle-system-in-html5-canvas
    });
  }

  updateLoop() {
    this.streamParticles.forEach((part) => {
      if (part.deleted) { return; }
      /* FIXME - for responsiveness, this should be
       * where the crosshairs are, not where they were? */
      const dy = part.targetLocation.y - part.currentLocation.y;
      const dx = part.targetLocation.x - part.currentLocation.x;

      // Yay stack overflow -
      // https://stackoverflow.com/questions/15375878/enemy-sprite-takes-a-strange-path-towards-the-player
      // Boo gavin math ability
      const speed = 15;
      const rotation = Math.atan2(dy, dx);

      /* Stupid detection to see if we've missed our mark */
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < speed) { // call it close enough
        part.deleted = true;
      }

      part.currentLocation.x += Math.cos(rotation) * speed;
      part.currentLocation.y += Math.sin(rotation) * speed;
      part.radius = Math.min(distance / speed / 4, 10);
    });
    this.streamParticles = this.streamParticles.filter((elm) => {
      return !elm.deleted;
    });
    this.streamParticles.push(
      {
        radius: 10,
        currentLocation: { x: this.canvas.width / 2, y: this.canvas.height },
        targetLocation: { x: this.crosshair.x, y: this.crosshair.y }
      }
    );
  }

  clickControl(direction, amount) {
    this.crosshair[direction] += amount * 10;
  }

  devOrientHandler(eventData) {
    // gamma is the left-to-right tilt in degrees, where right is positive
    const tiltLR = eventData.gamma;

    // beta is the front-to-back tilt in degrees, where front is positive
    const tiltFB = eventData.beta;

    // alpha is the compass direction the device is facing in degrees
    //const dir = eventData.alpha;

    this.crosshair.x = Math.max(0, Math.min(this.crosshair.x + tiltFB, this.canvas.width));
    this.crosshair.y = Math.max(0, Math.min(this.crosshair.y - tiltLR, this.canvas.height));
  }

  /*
  render() {
    const backgroundPositionStr = [
      this.state.backgroundPositionX + 'px',
      this.state.backgroundPositionY + 'px'
    ].join(' ');
  }
  */
}
