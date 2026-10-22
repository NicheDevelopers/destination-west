export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(colorHex: string): RGB {
  return {
    r: parseInt(colorHex.slice(1, 3), 16),
    g: parseInt(colorHex.slice(3, 5), 16),
    b: parseInt(colorHex.slice(5, 7), 16),
  };
}

export function rgbToHex(colorRgb: RGB): string {
  let hex = "#";
  for (const channel of Object.values(colorRgb)) {
    let channelValue = channel;
    if (Object.getPrototypeOf("") === Object.getPrototypeOf(channel))
      channelValue = parseInt(channel, 10);
    if (channelValue < 15) hex += "0";
    hex += channelValue.toString(16);
  }
  return hex.toUpperCase();
}
