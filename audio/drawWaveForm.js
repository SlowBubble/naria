// https://css-tricks.com/making-an-audio-waveform-visualizer-with-vanilla-javascript/

export class WaveFormDrawer {
  constructor(waveFormSub, leftCanvas) {

    waveFormSub(res => {
        draw(leftCanvas, res);
    });
  }
}

const draw = (canvas, normalizedData) => {
  const dpr = 1;
  const padding = 0;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = (canvas.offsetHeight + padding * 2) * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  // Set Y = 0 to be in the middle of the canvas
  ctx.translate(0, canvas.offsetHeight / 2 + padding);

  // draw the line segments
  const width = canvas.offsetWidth / normalizedData.length;
  for (let i = 0; i < normalizedData.length; i++) {
    const x = width * i;
    const datum = normalizedData[i];
    if (datum === null) {
      continue;
    }
    let height = datum * canvas.offsetHeight - padding;
    if (height < 0) {
        height = 0;
    } else if (height > canvas.offsetHeight / 2) {
        height = height > canvas.offsetHeight / 2;
    }
    drawLineSegment(ctx, x, canvas.offsetHeight, "#222", 10);
    drawLineSegment(ctx, x, height, "white", 1);
  }

  drawLineSegment(ctx, canvas.offsetWidth / 2, canvas.offsetHeight, "lightblue");
};

const drawLineSegment = (ctx, x, y, color, lineWidth) => {
  ctx.lineWidth = lineWidth; // how thick the line is
  ctx.strokeStyle = color; // what color our line is
  ctx.beginPath();
  ctx.moveTo(x, -y);
  ctx.lineTo(x, y);
  ctx.stroke();
};