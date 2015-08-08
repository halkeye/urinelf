import App from './app';
import screenfull from 'screenfull';

let app;

screen.lockOrientationUniversal = screen.lockOrientation ||
  screen.mozLockOrientation || screen.msLockOrientation;
screen.unlockOrientationUniversal = screen.unlockOrientation ||
  screen.mozUnlockOrientation || screen.msUnlockOrientation;

const onStartClick = () => {
  if (screenfull.enabled) {
    document.body.innerHTML = require('../html/body.html');
    screenfull.request(document.body);
  }
};

const showStartScreen = () => {
  document.body.innerHTML = require('../html/start.html');
  document.querySelector('#startBtn').addEventListener('click', onStartClick);
};

const lockOrientation = () => {
  if (window.screen) {
    if (window.screen.orientation) {
      window.screen.orientation.lock('landscape-primary');
    } else if (window.screen.lockOrientationUniversal) {
      window.screen.lockOrientationUniversal('landscape-primary');
    }
  }
};

const unlockOrientation = () => {
  if (window.screen) {
    if (window.screen.orientation) {
      window.screen.orientation.unlock();
    } else if (window.screen.unlockOrientationUniversal) {
      window.screen.unlockOrientationUniversal();
    }
  }
};

const onFullScreen = (/*event*/) => {
  if (screenfull.isFullscreen) {
    // The target of the event is always the document,
    // but it is possible to retrieve the fullscreen element through the API
    //screenfull.element
    lockOrientation();
    if (app) {
      app.stop();
      app = null;
    }
    app = new App();
    app.start();
  } else {
    unlockOrientation();
    if (app) {
      app.stop();
      app = null;
    }
    showStartScreen();
  }
};

document.addEventListener(screenfull.raw.fullscreenchange, onFullScreen);
showStartScreen();
