import { htmlCreate } from "@/lib/dom";
import keyman from "@/engine/KeyboardManager";

function kvForm(formOptions = []) {
  let form = document.createElement("form");
  form.classList.add("kvForm");

  let label = document.createElement("label");
  label.style.color = "white";
  label.innerHTML = "Input mode";

  let select = document.createElement("select");

  formOptions.forEach((option) => {
    htmlCreate({
      tagName: "option",
      value: option,
      innerHTML: option,
      appendTo: select,
    });
  });

  form.appendChild(label);
  form.appendChild(select);
  return { form: form, select: select };
}

/**
 * Add an input method for a button
 @param button - The button to add input methods to
 @param action - The action from keyman to execute on triggers
 @param triggerListenerType - The name of the event listener type to trigger the action
 @param cancelListenerType - The name of the event listener type to cancel the action
 */
function addInput(button, action, triggerListenerType, cancelListenerType) {
  let trigger = () => {
    if (!keyman.requests.hasValue(action)) keyman.requests.set(`Simulated ${action}`, action);
  };
  let cancel = () => {
    keyman.requests.deleteByValue(action);
  };

  // If cancelListenerType is not provided
  // triggerListenerType is used as a toggle function
  if (!cancelListenerType) {
    trigger = () => {
      if (keyman.requests.hasValue(action)) {
        keyman.requests.deleteByValue(action);
        return;
      }
      keyman.requests.set(`Simulated ${action}`, action);
    };
  }

  button.listeners.push({ type: triggerListenerType, listener: trigger });
  button.element.addEventListener(triggerListenerType, trigger);

  if (!cancelListenerType) return;
  button.listeners.push({ type: cancelListenerType, listener: cancel });
  button.element.addEventListener(cancelListenerType, cancel);
}

class KeyboardVisualizer {
  constructor(app, appendTo = document.body) {
    this.app = app;

    this.div = htmlCreate({
      classList: "kvDiv nodisp",
      appendTo: appendTo,
    });

    this.inputModes = new Map([
      ["Hover", () => this.hoverMode()],
      ["Toggle", () => this.toggleMode()],
      ["None", () => {}],
    ]);

    let { form, select } = kvForm(Array.from(this.inputModes.keys()));

    form.onchange = () => {
      let mode = select.options[select.selectedIndex].value;
      this.clearMode();
      this.inputModes.get(mode)();
    };

    this.div.appendChild(form);

    this.buttons = new Map([
      [
        "Move Left",
        {
          element: htmlCreate({
            id: "kvButtonLeft",
            classList: "kvButton",
            appendTo: this.div,
          }),
          listeners: [],
        },
      ],
      [
        "Move Up",
        {
          element: htmlCreate({
            id: "kvButtonUp",
            classList: "kvButton",
            appendTo: this.div,
          }),
          listeners: [],
        },
      ],
      [
        "Move Right",
        {
          element: htmlCreate({
            id: "kvButtonRight",
            classList: "kvButton",
            appendTo: this.div,
          }),
          listeners: [],
        },
      ],
      [
        "Move Down",
        {
          element: htmlCreate({
            id: "kvButtonDown",
            classList: "kvButton",
            appendTo: this.div,
          }),
          listeners: [],
        },
      ],
    ]);

    this.hoverMode();
  }

  setVisibility(visible) {
    if (visible) {
      this.div.classList.remove("nodisp");
      return;
    }
    this.div.classList.add("nodisp");
  }

  isVisible() {
    return !this.div.classList.contains("nodisp");
  }

  update() {
    if (!this.isVisible()) return;

    this.buttons.forEach((button, action) => {
      if (keyman.isActionRequested(action)) button.element.classList.add("active");
      else button.element.classList.remove("active");
    });
  }

  clearMode() {
    this.buttons.forEach((button) => {
      button.listeners.forEach((listener) => {
        button.element.removeEventListener(listener.type, listener.listener);
      });
      button.listeners = [];
    });
  }
  hoverMode() {
    this.buttons.forEach((button, action) => {
      addInput(button, action, "mouseover", "mouseout");
    });
  }
  toggleMode() {
    this.buttons.forEach((button, action) => {
      addInput(button, action, "click");
    });
  }
}

export default KeyboardVisualizer;
