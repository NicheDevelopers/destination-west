import Sprite from "@/engine/Sprite/Sprite";
import { DEFAULT_NOTIFICATION_TIMEOUT } from "./consts";

class Queue {
  items: Notification[];

  constructor(initItems: Notification[] = []) {
    this.items = initItems;
  }
  enqueue(item: Notification): void {
    this.items.push(item);
  }
  dequeue(): Notification | null {
    if (this.isEmpty()) return null;
    return this.items.shift() ?? null;
  }
  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

/* img is an img HTML element, probably obtained
   from a Sprite by the `img` field. */
export class Notification {
  text: string;
  sprite: Sprite;
  img: HTMLImageElement;
  timeout: number;

  constructor(
    text: string,
    spriteName: string,
    timeoutSeconds: number = DEFAULT_NOTIFICATION_TIMEOUT,
  ) {
    this.text = text;
    this.sprite = new Sprite(spriteName, { crop: true, nocache: true });
    this.img = this.sprite.img;
    this.timeout = timeoutSeconds * 1000;
  }
  createDiv(): HTMLDivElement {
    let div = document.createElement("div");
    div.classList.add("notification");

    let textDiv = document.createElement("div");
    textDiv.innerHTML = this.text;

    div.appendChild(this.img);
    div.appendChild(textDiv);

    return div;
  }
}

function slideToggle(div: HTMLElement): void {
  if (div.classList.contains("slide-down")) {
    div.classList.remove("slide-down");
    div.style.animation = "slideUp 0.5s forwards";
  } else {
    div.classList.add("slide-down");
    div.style.animation = "slideDown 0.5s forwards";
  }
}

class Notifier {
  queue: Queue;
  busy: boolean;

  constructor() {
    this.queue = new Queue();
    this.busy = false;
  }

  send(notification: Notification): void {
    this.queue.enqueue(notification);
  }

  update(): void {
    if (this.busy) return;

    let nextNotification = this.queue.dequeue();
    if (!nextNotification) return;

    let div = nextNotification.createDiv();
    //div.style.display = 'flex';
    slideToggle(div);

    const gameContainer = document.getElementById("game-container") ?? document.body;
    gameContainer.appendChild(div);

    this.busy = true;

    setTimeout(() => {
      //div.style.display = 'none';
      slideToggle(div);
      this.busy = false;
    }, nextNotification.timeout);
  }
}

export const notifier = new Notifier();
