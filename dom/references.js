const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');

const scoreElement = document.querySelector('#score');
const livesElement = document.querySelector('#lives');
const waveElement = document.querySelector('#wave');
const enemyCountElement = document.querySelector('#enemy-count');

const overlay = document.querySelector('#overlay');
const overlayTitle = document.querySelector('#overlay-title');
const overlayMessage = document.querySelector('#overlay-message');

const startButton = document.querySelector('#start-button');
const pauseButton = document.querySelector('#pause-button');
const restartButton = document.querySelector('#restart-button');
const fireButton = document.querySelector('#fire-button');

export {
  canvas,
  ctx,
  scoreElement,
  livesElement,
  waveElement,
  enemyCountElement,
  overlay,
  overlayTitle,
  overlayMessage,
  startButton,
  pauseButton,
  restartButton,
  fireButton,
};
