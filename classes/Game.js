import { CONFIG } from '../config/config.js';
import { InputManager } from './InputManager.js';
import { Enemy } from './Enemy.js';
import { Player } from './Player.js';
import { overlay, overlayMessage, overlayTitle } from '../dom/references.js';

import {
  startButton,
  restartButton,
  pauseButton,
  scoreElement,
  livesElement,
  waveElement,
  enemyCountElement,
} from '../dom/references.js';

export class Game {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.ctx = context;

    this.input = new InputManager();

    this.player = null;

    this.bullets = [];
    this.enemies = [];

    this.score = 0;
    this.wave = 1;

    this.spawnTimer = 0;

    this.state = 'ready';

    this.lastTime = 0;

    this.animationId = null;

    this.backgroundStars = Array.from({ length: 80 }, () => ({
      x: Math.random() * CONFIG.WIDTH,
      y: Math.random() * CONFIG.HEIGHT,
      radius: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    this.bindEvents();

    this.draw();

    this.syncHUD();
  }

  bindEvents() {
    startButton.addEventListener('click', () => {
      if (this.state === 'ready') {
        this.start();
      } else if (this.state === 'gameover') {
        this.start();
      } else if (this.state === 'paused') {
        this.resume();
      }
    });

    restartButton.addEventListener('click', () => {
      this.start();
    });

    pauseButton.addEventListener('click', () => {
      this.togglePause();
    });

    window.addEventListener('keydown', (event) => {
      if (event.code === 'KeyP') {
        this.togglePause();
      }
    });
  }

  start() {
    // Cancel an old loop before starting a new game.
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }

    this.player = new Player(CONFIG.WIDTH / 2, CONFIG.HEIGHT - 70, this.input);

    this.bullets = [];
    this.enemies = [];

    this.score = 0;
    this.wave = 1;
    this.spawnTimer = 0;

    this.lastTime = 0;

    this.state = 'playing';

    this.hideOverlay();

    pauseButton.textContent = '⏸ Pause';

    this.syncHUD();

    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  gameLoop(timestamp) {
    if (this.state !== 'playing') {
      this.animationId = null;
      return;
    }

    if (this.lastTime === 0) {
      this.lastTime = timestamp;
    }

    // Delta time is expressed in seconds.
    // The cap prevents huge movement after a tab is suspended.
    const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.05);

    this.lastTime = timestamp;

    this.update(deltaTime);

    this.draw();

    this.syncHUD();

    if (this.state === 'playing') {
      this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    } else {
      this.animationId = null;
    }
  }

  update(deltaTime) {
    if (!this.player) {
      return;
    }

    this.player.update(deltaTime, this);

    this.updateBullets(deltaTime);

    this.updateEnemies(deltaTime);

    this.handleCollisions();

    this.removeInactiveEntities();

    this.spawnEnemies(deltaTime);

    this.updateWave();

    if (this.player.lives <= 0) {
      this.endGame();
    }
  }

  updateBullets(deltaTime) {
    for (const bullet of this.bullets) {
      bullet.update(deltaTime);
    }
  }

  updateEnemies(deltaTime) {
    for (const enemy of this.enemies) {
      enemy.update(deltaTime, this);

      if (this.state !== 'playing') {
        return;
      }
    }
  }

  handleCollisions() {
    for (const bullet of this.bullets) {
      if (!bullet.active) {
        continue;
      }

      for (const enemy of this.enemies) {
        if (!enemy.active) {
          continue;
        }

        if (bullet.collidesWith(enemy)) {
          bullet.destroy();
          enemy.destroy();

          this.score += enemy.scoreValue;

          break;
        }
      }
    }

    for (const enemy of this.enemies) {
      if (!enemy.active) {
        continue;
      }

      if (this.player.collidesWith(enemy)) {
        enemy.destroy();

        const tookDamage = this.player.takeDamage();

        if (tookDamage && this.player.lives <= 0) {
          this.endGame();
          return;
        }
      }
    }
  }

  removeInactiveEntities() {
    this.bullets = this.bullets.filter((bullet) => bullet.active);

    this.enemies = this.enemies.filter((enemy) => enemy.active);
  }

  spawnEnemies(deltaTime) {
    this.spawnTimer += deltaTime;

    const spawnInterval = Math.max(
      0.35,
      CONFIG.ENEMY_SPAWN_INTERVAL - (this.wave - 1) * 0.06
    );

    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;

      const radius = 15;

      const x = radius + Math.random() * (CONFIG.WIDTH - radius * 2);

      this.enemies.push(new Enemy(x, -radius, this.wave));
    }
  }

  updateWave() {
    const newWave = Math.floor(this.score / 100) + 1;

    if (newWave > this.wave) {
      this.wave = newWave;
    }
  }

  togglePause() {
    if (this.state === 'playing') {
      this.pause();
    } else if (this.state === 'paused') {
      this.resume();
    }
  }

  pause() {
    if (this.state !== 'playing') {
      return;
    }

    this.state = 'paused';

    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.input.keys.clear();

    overlayTitle.textContent = 'PAUSED';

    overlayMessage.textContent =
      'The arena is frozen. Catch your breath, Commander.';

    startButton.textContent = 'RESUME GAME';

    overlay.classList.remove('hidden');

    pauseButton.textContent = '▶ Resume';
  }

  resume() {
    if (this.state !== 'paused') {
      return;
    }

    this.state = 'playing';

    this.lastTime = 0;

    this.hideOverlay();

    pauseButton.textContent = '⏸ Pause';

    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  endGame() {
    if (this.state !== 'playing') {
      return;
    }

    this.state = 'gameover';

    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.input.keys.clear();

    overlayTitle.textContent = 'GAME OVER';

    overlayMessage.textContent =
      `Final score: ${this.score}. ` +
      `You reached wave ${this.wave}. ` +
      'The enemy invasion won this round. Try again!';

    startButton.textContent = 'PLAY AGAIN';

    overlay.classList.remove('hidden');

    pauseButton.textContent = '⏸ Pause';
  }

  hideOverlay() {
    overlay.classList.add('hidden');
  }

  syncHUD() {
    scoreElement.textContent = this.score;

    livesElement.textContent = this.player ? this.player.lives : 3;

    waveElement.textContent = this.wave;

    enemyCountElement.textContent = this.enemies.length;
  }

  drawBackground() {
    this.ctx.fillStyle = '#080d1c';

    this.ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    // Draw subtle grid lines.
    this.ctx.strokeStyle = 'rgba(0, 245, 255, 0.06)';
    this.ctx.lineWidth = 1;

    const gridSize = 40;

    for (let x = 0; x <= CONFIG.WIDTH; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, CONFIG.HEIGHT);
      this.ctx.stroke();
    }

    for (let y = 0; y <= CONFIG.HEIGHT; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(CONFIG.WIDTH, y);
      this.ctx.stroke();
    }

    // Draw stars.
    for (const star of this.backgroundStars) {
      this.ctx.globalAlpha = star.alpha;

      this.ctx.fillStyle = '#ffffff';

      this.ctx.beginPath();

      this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);

      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
  }

  draw() {
    this.drawBackground();

    // Polymorphism:
    // each entity implements its own draw() method.
    if (this.player) {
      this.player.draw(this.ctx);
    }

    for (const bullet of this.bullets) {
      bullet.draw(this.ctx);
    }

    for (const enemy of this.enemies) {
      enemy.draw(this.ctx);
    }

    if (
      this.state === 'ready' ||
      this.state === 'paused' ||
      this.state === 'gameover'
    ) {
      return;
    }
  }
}
