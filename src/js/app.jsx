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
    this.crosshairs = {
      x: (this.canvas.width / 2),
      y: (this.canvas.height / 2)
    };

    this.ctx = this.canvas.getContext('2d');
    this.animFrame();
    setInterval(() => {
      this.streamParticles.push(
        {
          currentLocation: { x: 0, y: 0 },
          targetLocation: { x: this.crosshairs.x, y: this.crosshairs.y }
        }
      );
    }, 30);
  }

  animFrame() {
    raf(this.animFrame.bind(this));
    this.renderLoop();
    this.updateLoop();
  }

  renderLoop(dt) {
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
    // Should instead xor out the previous location drawings, but easier just to clear and redraw
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    /* FIXME */
    if (this.streamParticles.length === 0) {
      this.streamParticles.push(
        {
          currentLocation: { x: 0, y: 0 },
          targetLocation: { x: this.crosshairs.x, y: this.crosshairs.y }
        }
      );
    }
    this.ctx.beginPath();
    this.ctx.fillStyle = 'rgb(255,255,255)';
    this.ctx.moveTo(this.crosshairs.x - 10, this.crosshairs.y);
    this.ctx.lineTo(this.crosshairs.x + 10, this.crosshairs.y);
    this.ctx.stroke();
    this.ctx.moveTo(this.crosshairs.x, this.crosshairs.y - 10);
    this.ctx.lineTo(this.crosshairs.x, this.crosshairs.y + 10);
    this.ctx.stroke();

    this.streamParticles.forEach((part) => {
      if (part.deleted) { return; }
      this.ctx.fillStyle = 'yellow';
      // Nicer Particles - http://thecodeplayer.com/walkthrough/make-a-particle-system-in-html5-canvas
      this.ctx.fillRect(part.currentLocation.x, part.currentLocation.y, 10, 10);
    });
  }

  updateLoop() {
    this.streamParticles.forEach((part) => {
      if (part.deleted) { return; }

      // Yay stack overflow -
      // https://stackoverflow.com/questions/15375878/enemy-sprite-takes-a-strange-path-towards-the-player
      // Boo gavin math ability
      const speed = 15;
      const rotation = Math.atan2(
        part.targetLocation.y - part.currentLocation.y,
        part.targetLocation.x - part.currentLocation.x
      );

      if (part.currentLocation.rotation) {
        /* Stupid detection to see if we've missed our mark */
        if (rotation !== part.currentLocation.rotation) {
          part.deleted = true;
        }
      }
      part.currentLocation.rotation = rotation;

      part.currentLocation.x += Math.cos(rotation) * speed;
      part.currentLocation.y += Math.sin(rotation) * speed;
    });
    this.streamParticles = this.streamParticles.filter((elm) => {
      return !elm.deleted;
    });
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
          <canvas ref="canvas" style={{ height: '100%', width: '100%', display: 'block' }}>
          </canvas>
        </div>
        <div className="controlls row">
          {/* If no accelerometer support (as on first event, hide this)
              then add manual controls here */}
        </div>
      </div>
    );
  }
}
