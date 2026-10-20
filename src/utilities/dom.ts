import "./utilities.js"; // Array prototype extensions

/**
   Create a specified HTML element with specified
   attributes and return it.
   
   Unrecognized element attributes are treated
   as style attributes.
   The function throws if a provided attribute is not
   a valid element attribute, not a valid style attribute
   and not a valid special attribute from the list below.

   Optional special attributes:
   (name: type [defaultValue] - description)
   
   tagName: String ["div"]
     - tag name of the element to create
   
   appendTo: Node
     - a node to which the new element should be appended
     to. if none provided, the element is not appended
     to anything
 */
export function htmlCreate(
  args: { tagName?: string; appendTo?: Node } & Record<string, unknown>,
): HTMLElement {
  const { tagName: requestedTagName, appendTo, ...properties } = args;
  let tagName = requestedTagName;

  if (tagName === undefined) tagName = "div";
  let d = document.createElement(tagName);

  if (appendTo) {
    appendTo.appendChild(d);
  }
  const element = d as HTMLElement & Record<string, unknown>;
  const style = d.style as unknown as Record<string, unknown>;
  for (const property in properties) {
    if (element[property] === undefined) {
      if (style[property] === undefined) {
        throw new Error(`Unrecognized '${tagName}' property: ${property}`);
      }
      style[property] = properties[property];
      continue;
    }
    element[property] = properties[property];
  }
  return d;
}

/**
 * Create HTML elements
 * @param {string} element name of element
 * @param {number} [w = null] - width
 * @param {number} [h = null] - height
 * @param {string[]} [classes = []] - array of css classes
 * @param {Record<string, string>} [styles = {}] - object containing style properties
 * @param {string} [id = null] - id of the element
 * @param {string} [text = null] - inner text of element
 * @returns {Element} created element
 */
export function createElement(
  element: string,
  w: number | null = null,
  h: number | null = null,
  classes: string[] = [],
  styles: Record<string, string> = {},
  id?: string | null | undefined,
  text: string | null = null,
): HTMLElement {
  // needed test if element is equal to some given possibile outcomes
  let r = document.createElement(element);
  classes.forEach((styleClass) => r.classList.add(styleClass));
  if (w != null && h != null) r.setAttribute("style", `width: ${w}px; height: ${h}px`);
  const style = r.style as unknown as Record<string, string>;
  for (const styleName in styles) {
    style[styleName] = styles[styleName];
  }
  r.innerText = text ?? "";
  if (id === undefined || id === null) return r;
  r.setAttribute("id", `${id}`);
  return r;
}

export function createCanvas(
  w: number,
  h: number | null = null,
): { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D } {
  let r = document.createElement("canvas");
  r.width = w;
  r.height = h ?? w;
  const context = r.getContext("2d");
  if (!context) throw new Error("Canvas context not available");
  return { canvas: r, context: context };
}

export function makeErrorInfoHeader(error: Error, appendTo: HTMLElement): HTMLElement {
  const errorStack = error.stack;
  if (!errorStack) throw new Error(`Error stack is undefined`);
  const errorInfo = errorStack.split("\n").first!.split("@");
  const errorFunction = errorInfo.first;
  const errorLocationText = errorInfo.last!.split(/:[/][/].*?[//]/i).last;

  const content = `Thrown by ${errorFunction}() @ `;
  let header = htmlCreate({
    tagName: "h3",
    innerText: content,
    appendTo: appendTo,
  });

  htmlCreate({
    tagName: "span",
    innerText: errorLocationText,
    appendTo: header,
  });

  return header;
}
