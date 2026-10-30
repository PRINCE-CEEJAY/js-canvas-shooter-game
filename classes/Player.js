import { CONFIG } from '../config/config.js';
import { Entity } from './Entity.js';
import { Bullet } from './Bullet.js';
export class Player extends Entity {
  constructor(x, y, input) {
    super(x, y, CONFIG.PLAYER_SIZE, CONFIG.PLAYER_COLOR);

    this.input = input;

    this.speed = CONFIG.PLAYER_SPEED;

    this.lives = 3;

    this.shootCooldown = 0;

    this.invulnerabilityTimer = 0;
    this.invulnerabilityDuration = 1.2;
  }

  update(deltaTime, game) {
    this.handleMovement(deltaTime);

    this.shootCooldown = Math.max(0, this.shootCooldown - deltaTime);

    this.invulnerabilityTimer = Math.max(
      0,
      this.invulnerabilityTimer - deltaTime
    );

    if (this.input.isDown('Space') && this.shootCooldown === 0) {
      this.shoot(game);
    }
  }

  handleMovement(deltaTime) {
    let dx = 0;
    let dy = 0;

    if (this.input.isDown('ArrowLeft', 'KeyA')) {
      dx -= 1;
    }

    if (this.input.isDown('ArrowRight', 'KeyD')) {
      dx += 1;
    }

    if (this.input.isDown('ArrowUp', 'KeyW')) {
      dy -= 1;
    }

    if (this.input.isDown('ArrowDown', 'KeyS')) {
      dy += 1;
    }

    // Normalize movement to prevent diagonal speed boosts.
    if (dx !== 0 || dy !== 0) {
      const magnitude = Math.hypot(dx, dy);

      dx /= magnitude;
      dy /= magnitude;
    }

    this.x += dx * this.speed * deltaTime;
    this.y += dy * this.speed * deltaTime;

    // Keep the player inside the arena.
    this.x = Math.max(
      this.radius,
      Math.min(CONFIG.WIDTH - this.radius, this.x)
    );

    this.y = Math.max(
      this.radius,
      Math.min(CONFIG.HEIGHT - this.radius, this.y)
    );
  }

  shoot(game) {
    const bullet = new Bullet(this.x, this.y - this.radius - 5);

    game.bullets.push(bullet);

    this.shootCooldown = CONFIG.BULLET_COOLDOWN;
  }

  takeDamage() {
    if (this.invulnerabilityTimer > 0) {
      return false;
    }

    this.lives -= 1;

    this.invulnerabilityTimer = this.invulnerabilityDuration;

    return true;
  }

  draw(context) {
    // Flash while temporarily invulnerable.
    if (
      this.invulnerabilityTimer > 0 &&
      Math.floor(this.invulnerabilityTimer * 12) % 2 === 0
    ) {
      return;
    }

    context.save();

    context.translate(this.x, this.y);

    context.fillStyle = this.color;
    context.strokeStyle = '#ffffff';
    context.lineWidth = 2;

    context.shadowColor = this.color;
    context.shadowBlur = 20;

    // Draw a triangular spaceship.
    context.beginPath();

    context.moveTo(0, -this.radius - 6);
    context.lineTo(this.radius, this.radius);
    context.lineTo(0, this.radius * 0.5);
    context.lineTo(-this.radius, this.radius);

    context.closePath();

    context.fill();
    context.stroke();

    context.restore();
  }
}
