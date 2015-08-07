import App from './app';
import screenfull from 'screenfull';

let app;

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

const onFullScreen = (/*event*/) => {
  if (screenfull.isFullscreen) {
    // The target of the event is always the document,
    // but it is possible to retrieve the fullscreen element through the API
    //screenfull.element
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.lock('landscape-primary');
    }
    if (app) {
      app.stop();
      app = null;
    }
    app = new App();
    app.start();
  } else {
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.unlock();
    }
    if (app) {
      app.stop();
      app = null;
    }
    showStartScreen();
  }
};

document.addEventListener(screenfull.raw.fullscreenchange, onFullScreen);
showStartScreen();
