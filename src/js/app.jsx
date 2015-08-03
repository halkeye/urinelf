import React from 'react';
import raf from 'raf';
//import Promise from 'bluebird';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {};
    this.streamParticles = [ ];

  }
  componentDidMount() {
    //setInterval(this.updateLoop.bind(this), 100);

    this.canvas = React.findDOMNode(this.refs.canvas);
    this.canvas.height = this.canvas.scrollHeight;
    this.canvas.width = this.canvas.scrollWidth;
    this.crosshair = {
      radius: 10,
      x: (this.canvas.width / 2),
      y: (this.canvas.height / 2)
    };

    this.ctx = this.canvas.getContext('2d');
    this.animFrame();
    setInterval(() => {
      this.streamParticles.push(
        {
          radius: 10,
          currentLocation: { x: 0, y: 0 },
          targetLocation: { x: this.crosshair.x, y: this.crosshair.y }
        }
      );
    }, 30);
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
      if (distance < part.radius + this.crosshair.radius) { // call it close enough
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

  render() {
    return (
      <div>
        <div className="title">
          <div>
            <h1>Hit the Urine-elf</h1>
          </div>
        </div>
        <div className="game row">
          {/*
              1 canvas for stream,
              1 canvas for background,
              1 canvas for elf?
            */}
          <canvas ref="canvas" style={{ height: '100%', width: '100%', display: 'block' }}></canvas>
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
