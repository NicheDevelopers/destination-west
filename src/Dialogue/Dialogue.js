function parseDialogue(text, playerName, npcName) {
  let whoMap = (c) => c === 'P' ? playerName : npcName;

  return text.split('\n')
    .filter((e) => e)
    .map(s => s.split('|'))
    .map(([who, what]) => ({
      who: whoMap(who),
      what: what.replaceAll("NPC_NAME", npcName)
        .replaceAll("PLAYER_NAME", playerName),
      n: 0
    }));
}

/*
  Dialogue is an iterator that returns subsequent lines of a dialogue.
  Each line is meant to be displayed letter-by-letter, so it has the
  `n` counter, which is incremented with time and a substring
  from 0 to n is displayed
  */
class Dialogue {
  constructor(filename, playerName, npcName) {
    // PlayerName is given here so that whenReady can have a simpler arglist.
    // the name doesn't change anyway.
    this.playerName = playerName;
    this.npcName = npcName;
    this.loaded = false;
    this._n = 0;
    this.text = null;
    this.lines = null;
    this.load(filename);
  }
  load(filename) {
    fetch(filename).then(
      r => {
        if (!r.ok)
          throw new Error("Dialogue Fetch Error: " + r.status);
        r.text().then(t => {
          this.loaded = true;
          this.text = t;
          this.lines = parseDialogue(this.text, this.playerName, this.npcName);
        });
      });
  }
  // whenReady(callback) {
  //   if (!this.loaded) {
  //     setTimeout(() => this.whenReady(callback), 0);
  //     return;
  //   }
  //   callback(parseDialogue());
  // }
  next() {
    if (!this.loaded) return false;
    if (this.exhausted()) return null;
    return this.lines[this._n++];
  }
  formatLine(line) {
    return `${line.who}: ${line.what.substring(0, line.n)}`;
  }
  exhausted() {
    return this._n > this.lines.length - 1;
  }
  reset() {
    this._n = 0;
    this.lines.forEach(l => {l.n = 0});
  }

}

export default Dialogue;
