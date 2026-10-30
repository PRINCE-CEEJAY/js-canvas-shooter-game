import { Entity } from './Entity.js';
import { CONFIG } from '../config/config.js';

export class Enemy extends Entity {
  constructor(x, y, wave) {
    super(x, y, 15, CONFIG.ENEMY_COLOR);

    this.speed =
      CONFIG.ENEMY_MIN_SPEED +
      Math.random() * (CONFIG.ENEMY_MAX_SPEED - CONFIG.ENEMY_MIN_SPEED) +
      wave * 4;

    this.horizontalOffset = Math.random() * Math.PI * 2;

    this.age = 0;

    this.scoreValue = 10;
  }

  update(deltaTime, game) {
    this.age += deltaTime;

    this.y += this.speed * deltaTime;

    // Small horizontal movement makes enemies less predictable.
    this.x += Math.sin(this.age * 3 + this.horizontalOffset) * 35 * deltaTime;

    this.x = Math.max(
      this.radius,
      Math.min(CONFIG.WIDTH - this.radius, this.x)
    );

    if (this.y - this.radius > CONFIG.HEIGHT) {
      this.destroy();

      game.player.takeDamage();

      game.syncHUD();

      if (game.player.lives <= 0) {
        game.endGame();
      }
    }
  }

  draw(context) {
    context.save();

    context.translate(this.x, this.y);

    context.fillStyle = this.color;
    context.strokeStyle = '#ffc5e7';
    context.lineWidth = 1.5;

    context.shadowColor = this.color;
    context.shadowBlur = 15;

    // Draw a diamond-shaped enemy.
    context.beginPath();

    context.moveTo(0, -this.radius);
    context.lineTo(this.radius, 0);
    context.lineTo(0, this.radius);
    context.lineTo(-this.radius, 0);

    context.closePath();

    context.fill();
    context.stroke();

    context.restore();
  }
}
