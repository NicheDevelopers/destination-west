import { statThresholds as thresholds } from "../global/consts.js";
  
export default class Stats {
  constructor() {
    this.anger = 0;
    this.respect = 0;
    this.trust = 0;
  }
  
  /**
   * Modify a certain statistic value
   */
  change(statName, changeValue) {
    if (this[statName] === undefined)
      throw `Attempt to modify a non existent statistic '${statName}'`;
    this[statName] += changeValue;
  }
  
  /**
   * Check the status of a certain statistic value
   */
  check(statName) {
    if (this[statName] === undefined)
      throw `Attempt to check a non existent statistic '${statName}'`;
    
    if (this[statName] <= thresholds[statName].min)
      return Stats.NONE;

    if (this[statName] <= thresholds[statName].medium)
      return Stats.MODERATE;

    if (this[statName] <= thresholds[statName].max)
      return Stats.HIGH;

    return Stats.MAX;
  }

  static ANGER = "anger";
  static RESPECT = "respect";
  static TRUST = "trust";

  static NONE = "none";
  static MODERATE = "moderate";
  static HIGH = "high";
  static MAX = "max";
}
