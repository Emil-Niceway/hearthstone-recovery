export function generateNoiseTexture(width: number, height: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const value = Math.random() * 255;
    data[i] = value; // red
    data[i + 1] = value; // green
    data[i + 2] = value; // blue
    data[i + 3] = 255; // alpha
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}
