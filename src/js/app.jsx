import React from 'react';
import raf from 'raf';
//import Promise from 'bluebird';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      backgroundPositionX: 0,
      backgroundPositionY: 0
    };
    this.streamParticles = [ ];

  }
  componentDidMount() {
    //setInterval(this.updateLoop.bind(this), 100);
    if (window.DeviceOrientationEvent) {
      // Listen for the event and handle DeviceOrientationEvent object
      window.addEventListener('deviceorientation', this.devOrientHandler.bind(this), false);
    }

    this.canvas = React.findDOMNode(this.refs.canvas);
    this.canvas.height = this.canvas.scrollHeight;
    this.canvas.width = this.canvas.scrollWidth;
    this.crosshair = {
      radius: 10,
      x: (this.canvas.width / 2),
      y: (this.canvas.height / 2)
    };

    this.ctx = this.canvas.getContext('2d');
    /*
    this.animFrame();
    setInterval(() => {
      this.streamParticles.push(
        {
          radius: 10,
          currentLocation: { x: this.canvas.width / 2, y: this.canvas.height },
          targetLocation: { x: this.crosshair.x, y: this.crosshair.y }
        }
      );
    }, 30);
    */
  }

  animFrame() {
    raf(this.animFrame.bind(this));
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
      // Nicer Particles - http://thecodeplayer.com/walkthrough/make-a-particle-system-in-html5-canvas
      this.ctx.fillRect(part.currentLocation.x, part.currentLocation.y, part.radius, part.radius);
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
    });
    this.streamParticles = this.streamParticles.filter((elm) => {
      return !elm.deleted;
    });
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

    this.setState({
      backgroundPositionX: this.state.backgroundPositionX - tiltLR,
      backgroundPositionY: this.state.backgroundPositionY - tiltFB
    });
  }

  onStartClick() {
    document.body.webkitRequestFullScreen();
    //console.log(window.screen.lockOrientation.lock();
  }
  render() {
    const backgroundPositionStr = [
      this.state.backgroundPositionX + 'px',
      this.state.backgroundPositionY + 'px'
    ].join(' ');
    return (
      <div>
        <div className="title">
          <div>
            <h1>Hit the elf</h1>
            <button onClick={this.onStartClick.bind(this)}>Start</button>
          </div>
        </div>
        <div className="game row">
          {/*
              1 canvas for stream,
              1 canvas for background,
              1 canvas for elf?
            */}
          <div style={{
            height: '100%',
            width: '100%',
            display: 'block',
            backgroundImage: 'url(' + require('../images/toxic1.png') + ')',
            backgroundPosition: backgroundPositionStr
          }}>
            <canvas ref="canvas" style={{
              height: '100%',
              width: '100%',
              display: 'block' }}>
            </canvas>
          </div>
        </div>
        <div className="controlls row">
          <div className="keyboard">
            <section className="keyRow">
              <div className="keyGap"></div>
              <div className="key" onClick={this.clickControl.bind(this, 'y', -1)}>Up</div>
              <div className="keyGap"></div>
            </section>
            <section className="keyRow">
              <div className="key" onClick={this.clickControl.bind(this, 'x', -1)}>Left</div>
              <div className="key" onClick={this.clickControl.bind(this, 'y', 1)}>Down</div>
              <div className="key" onClick={this.clickControl.bind(this, 'x', 1)}>Right</div>
            </section>
          </div>
          {/* If no accelerometer support (as on first event, hide this)
              then add manual controls here */}
        </div>
      </div>
    );
  }
}
