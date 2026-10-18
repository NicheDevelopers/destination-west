import Sprite from "../Sprite/Sprite.js";
import { defaultNotificationTimeout } from "./consts.js";

class Queue {
  constructor(initItems = []) {
    this.items = initItems;
  }
  enqueue(item) {
    this.items.push(item);
  }
  dequeue() {
    if (this.isEmpty()) return null;
    return this.items.shift();
  }
  isEmpty() {
    return this.items.length === 0;
  }
  peek() {
    if (this.isEmpty()) return null;
    return this.items[0];
  }
}

/* img is an img HTML element, probably obtained
   from a Sprite by the `img` field. */
export class Notification {
  constructor(text, spriteName, timeoutSeconds = defaultNotificationTimeout) {
    this.text = text;
    this.sprite = new Sprite(spriteName, { crop: true, nocache: true });
    this.img = this.sprite.img;
    this.timeout = timeoutSeconds * 1000;
  }
  createDiv() {
    let div = document.createElement("div");
    div.classList.add("notification");

    let textDiv = document.createElement("div");
    textDiv.innerHTML = this.text;

    div.appendChild(this.img);
    div.appendChild(textDiv);

    return div;
  }
}

function slideToggle(div) {
  if (div.classList.contains("slide-down")) {
    div.classList.remove("slide-down");
    div.style.animation = "slideUp 0.5s forwards";
  } else {
    div.classList.add("slide-down");
    div.style.animation = "slideDown 0.5s forwards";
  }
}

class Notifier {
  constructor() {
    this.queue = new Queue();
    this.busy = false;
  }

  send(notification) {
    this.queue.enqueue(notification);
  }

  update() {
    if (this.queue.isEmpty() || this.busy) return;

    let nextNotification = this.queue.dequeue();
    let div = nextNotification.createDiv();
    //div.style.display = 'flex';
    slideToggle(div);

    let gc = document.getElementById("game-container");
    gc.appendChild(div);

    this.busy = true;

    setTimeout(
      function () {
        //div.style.display = 'none';
        slideToggle(div);
        this.busy = false;
      }.bind(this),
      nextNotification.timeout,
    );
  }
}

export const notifier = new Notifier();
