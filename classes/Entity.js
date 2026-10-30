export class Entity {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;

    this.active = true;
  }

  update(_deltaTime) {
    // Subclasses implement their own update behavior.
  }

  draw(context) {
    context.save();

    context.fillStyle = this.color;
    context.shadowColor = this.color;
    context.shadowBlur = 15;

    context.beginPath();

    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    context.fill();

    context.restore();
  }

  destroy() {
    this.active = false;
  }

  collidesWith(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;

    const distance = Math.hypot(dx, dy);

    return distance < this.radius + other.radius;
  }
}
