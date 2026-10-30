import { fireButton } from '../dom/references.js';

export class InputManager {
  constructor() {
    this.keys = new Set();

    this.preventedKeys = new Set([
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Space',
    ]);

    window.addEventListener('keydown', (event) => {
      if (this.preventedKeys.has(event.code)) {
        event.preventDefault();
      }

      this.keys.add(event.code);
    });

    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.keys.clear();
      }
    });

    this.setupTouchControls();
  }

  isDown(...keys) {
    return keys.some((key) => this.keys.has(key));
  }

  setupTouchControls() {
    const touchButtons = document.querySelectorAll('[data-key]');

    touchButtons.forEach((button) => {
      const key = button.dataset.key;

      const press = (event) => {
        event.preventDefault();
        this.keys.add(key);
      };

      const release = (event) => {
        event.preventDefault();
        this.keys.delete(key);
      };

      button.addEventListener('pointerdown', press);

      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', release);
      button.addEventListener('contextmenu', (event) => {
        event.preventDefault();
      });
    });

    fireButton.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      this.keys.add('Space');
    });

    const releaseFire = (event) => {
      event.preventDefault();
      this.keys.delete('Space');
    };

    fireButton.addEventListener('pointerup', releaseFire);
    fireButton.addEventListener('pointercancel', releaseFire);
    fireButton.addEventListener('lostpointercapture', releaseFire);
  }
}
