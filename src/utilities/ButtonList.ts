import { htmlCreate } from "./dom.js";

/**
 * Easily create nested button lists
 * @param options.callbackArgument
 * An argument passed to the callback functions of the buttons.
 * @param options.rowCount
 * If provided, the grid layout will be used for the ButtonList instead of flex.
 * This parameter specifies the number of columns in the grid layout.
 * If added, the ButtonList.BACK option will be automatically set to the last button
 * in the list, preserving spacing (empty rows) if less than the rowCount buttons are added.
 * The grid layout has one column. More column layouts are not yet supported.
 */
export class ButtonList {
  readonly div: HTMLElement;
  private buttons: HTMLElement[] = [];
  private callbackArgument: any;
  private rowCount: number | undefined;
  private parentList: ButtonList | undefined;
  private otherList: ButtonList | undefined;

  constructor(
    options: {
      callbackArgument?: any;
      rowCount?: number;
    } = {},
  ) {
    this.div = htmlCreate({
      classList: "button-list",
    });
    this.reset();

    /**
     * The argument that is passed to buttons' callback functions
     */
    this.callbackArgument = options.callbackArgument;

    /**
     * The number of rows in the grid layout
     */
    this.rowCount = options.rowCount;

    this.style();
  }

  /**
   * Adds a button to the ButtonList.
   * @param buttonText - The text displayed on the button
   * @param action
   * - A callback function called when the button is pressed,
   * another ButtonList that replaces this one in the display, or
   * a the ButtonList.BACK static value that indicates going going
   * up a level in the nested hierarchy.
   */
  add(buttonText: string, action: any) {
    if (typeof action === "function") {
      this.pushButton(buttonText, () => action(this.callbackArgument));
      return;
    }
    if (action === ButtonList.BACK) {
      this.pushButton(
        buttonText,
        () => this.backCallback(),
        this.rowCount ? `grid-row: ${this.rowCount}` : "",
      );
      return;
    }
    if (action?.constructor?.name !== "ButtonList")
      throw new Error(
        `Button actions need to be either a function, ` +
          `a different ButtonList or ButtonList.BACK. ` +
          `Got: ${typeof action === "string" ? `'${action}'` : typeof action}`,
      );

    let otherList = action;
    otherList.parentList = this;

    this.pushButton(buttonText, () => this.displayButtonsFrom(otherList));
  }

  /**
   * Push a button with a specified text and onclick
   * to the `this.buttons` array. For internal use.
   */
  private pushButton(buttonText: string, onclick: () => void, style = "") {
    this.buttons.push(
      htmlCreate({
        tagName: "button",
        innerText: buttonText,
        onclick: onclick,
        style: style,
        appendTo: this.div,
      }),
    );
  }

  /**
   * A function called by a deeper nested ButtonList
   * when a ButtonList.BACK button has been clicked.
   * Used to signal the decision to the upper ButtonList.
   */
  backCallback(): void {
    if (!this.parentList) throw new Error(`Attempt to go back from a top-level ButtonList`);
    this.parentList.back();
  }

  /**
   * Display the original content of this ButtonList
   */
  back(): void {
    this.displayButtonsFrom(this);
  }

  /**
   * Append buttons from the provided ButtonList to `this.div`.
   */
  displayButtonsFrom(list: ButtonList): void {
    if (this.parentList) {
      // If this ButtonList is nested, outsource the display
      // responsibility to the parent ButtonList
      return this.parentList.displayButtonsFrom(list);
    }
    this.otherList = list;
    this.clear();
    this.otherList.buttons.forEach((button) => {
      this.div.appendChild(button);
    });
    this.style();
  }

  appendTo(node: HTMLElement) {
    node.appendChild(this.div);
  }

  /**
   * Applies styling (as defined in constructor's `options`) to the ButtonList
   */
  style(): void {
    if (this.rowCount === undefined) return;
    this.div.classList.add("grid");
    this.div.style.gridTemplateRows = `repeat(${this.rowCount}, 1fr`;
  }

  /**
   * Removes all children from `this.div` and clears `this.div` styling.
   */
  clear(): void {
    while (this.div.firstChild) this.div.removeChild(this.div.firstChild);

    this.div.classList.remove("grid");
    this.div.style.gridTemplateRows = "";
  }

  reset(): void {
    this.clear();
    this.buttons = [];
    this.callbackArgument = undefined;
  }

  /**
   * Set the ButtonList to inherit the construction options of another ButtonList
   * @param otherList
   * The ButtonList from which the construction options are to be inherited
   * @returns this
   */
  inherit(otherList: ButtonList): ButtonList {
    this.callbackArgument = otherList.callbackArgument;
    this.rowCount = otherList.rowCount;
    return this;
  }

  static BACK = "back";
}
