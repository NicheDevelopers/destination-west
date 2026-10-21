import { STAT_THRESHOLDS as thresholds } from "@/game/consts";

export type StatName = "anger" | "respect" | "trust";

export type StatLevel = "none" | "moderate" | "high" | "max";

/**
 * Description of a character's statistics related to
 * their feelings and trust towards the player.
 */
export default class Stats {
  private anger: number;
  private respect: number;
  private trust: number;

  constructor() {
    this.anger = 0;
    this.respect = 0;
    this.trust = 0;
  }

  change(statName: StatName, changeValue: number): void {
    if (this[statName] === undefined)
      throw new Error(`Attempt to modify a non existent statistic '${statName}'`);
    this[statName] += changeValue;
  }

  check(statName: StatName): StatLevel {
    if (this[statName] === undefined)
      throw new Error(`Attempt to check a non existent statistic '${statName}'`);

    if (this[statName] <= thresholds[statName].min) return Stats.NONE;

    if (this[statName] <= thresholds[statName].medium) return Stats.MODERATE;

    if (this[statName] <= thresholds[statName].max) return Stats.HIGH;

    return Stats.MAX;
  }

  static readonly ANGER = "anger";
  static readonly RESPECT = "respect";
  static readonly TRUST = "trust";

  static readonly NONE = "none";
  static readonly MODERATE = "moderate";
  static readonly HIGH = "high";
  static readonly MAX = "max";
}
