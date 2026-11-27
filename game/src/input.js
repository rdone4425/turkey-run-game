// Gobbler's Great Escape — keyboard and mouse input.
// Tracks held keys and one-frame "just pressed" edges, plus clicks on the
// canvas. The game reads this, never raw DOM events.

export function createInput(canvas) {
  const held = new Set();
  const pressed = new Set();
  let clickX = -1;
  let clickY = -1;
  let clicked = false;

  const KEYMAP = {
    ArrowUp: 'jump',
    Space: 'jump',
    KeyW: 'jump',
    ArrowDown: 'duck',
    KeyS: 'duck',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ShiftLeft: 'sprint',
    ShiftRight: 'sprint',
    Enter: 'start',
    KeyR: 'restart',
    KeyP: 'pause',
    Escape: 'pause',
    KeyM: 'mute',
  };

  function onKeyDown(event) {
    const action = KEYMAP[event.code];
    if (!action) return;
    if (event.code === 'Space' || event.code.startsWith('Arrow')) {
      event.preventDefault();
    }
    if (!event.repeat) pressed.add(action);
    held.add(action);
  }

  function onKeyUp(event) {
    const action = KEYMAP[event.code];
    if (!action) return;
    held.delete(action);
  }

  function onMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    clickX = ((event.clientX - rect.left) / rect.width) * canvas.width;
    clickY = ((event.clientY - rect.top) / rect.height) * canvas.height;
    clicked = true;
    // A click is also a jump, so mouse-only play works.
    pressed.add('jump');
    held.add('jump');
  }

  function onMouseUp() {
    held.delete('jump');
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);

  return {
    isHeld(action) {
      return held.has(action);
    },
    // True once, on the frame the key or click went down.
    wasPressed(action) {
      return pressed.has(action);
    },
    // True once, on the frame the canvas was clicked.
    wasClicked() {
      return clicked;
    },
    clickPos() {
      return { x: clickX, y: clickY };
    },
    // Call at the end of every frame so edges last exactly one frame.
    endFrame() {
      pressed.clear();
      clicked = false;
    },
  };
}
