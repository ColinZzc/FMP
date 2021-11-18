export function rampX(color, n = 300) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext("2d");
  for (let i = 0; i < n; ++i) {
    context.fillStyle = color(i / (n - 1));
    context.fillRect(i, 0, 1, 150);
  }
  return canvas;
}

