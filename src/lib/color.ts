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
  for (const element of Object.values(colorRgb)) {
    let intElement = element;
    if (Object.getPrototypeOf("") === Object.getPrototypeOf(element))
      intElement = parseInt(element, 10);
    if (intElement < 15) hex += "0";
    hex += intElement.toString(16);
  }
  return hex.toUpperCase();
}
