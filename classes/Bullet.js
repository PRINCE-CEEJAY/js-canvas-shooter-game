import { Entity } from './Entity.js';
import { CONFIG } from '../config/config.js';

export class Bullet extends Entity {
  constructor(x, y) {
    super(x, y, CONFIG.BULLET_RADIUS, CONFIG.BULLET_COLOR);

    this.speed = CONFIG.BULLET_SPEED;
  }

  update(deltaTime) {
    this.y -= this.speed * deltaTime;

    if (this.y + this.radius < 0) {
      this.destroy();
    }
  }

  draw(context) {
    context.save();

    context.fillStyle = this.color;
    context.shadowColor = this.color;
    context.shadowBlur = 15;

    context.fillRect(this.x - 2, this.y - 9, 4, 18);

    context.restore();
  }
}
