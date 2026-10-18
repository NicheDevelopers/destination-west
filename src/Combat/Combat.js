import Player from "../Entity/Player.js";
import { randIntInRange } from "../global/utilities.js";

/**
 * Describes various variables that affect combat difficulty.
 * Created before the fight and passed as a parameter to `CombatConfig`
 **/
export class Difficulty {}

/**
 * Enum listing types of Combat initiation.
 * Combat can be started either as a fair fight or an ambush against one of the sides.
 **/
export const CombatInitiationType = {
  Normal: "Normal",
  Ambush: "Ambush",
};

export class CombatConfig {
  /**
   * Create a new CombatConfig
   @param {Difficulty} difficulty
   @param {CombatInitiationType} initiationType 
   **/
  constructor(initiationType, difficulty) {
    this.initiation = initiationType;
    this.difficulty = difficulty;
  }
}
////////////// END Combat Config //////////

const ActionType = {
  Attack: "Attack",
  Retreat: "Retreat",
  Ability: "Ability",
  UseItem: "UseItem",
};

class CombatActionProps {
  constructor(options = {}) {
    if (options.who === undefined)
      throw new Error("CombatActionProps: 'who' is a required parameter");
    if (options.type === undefined)
      throw new Error("CombatActionProps: 'type' is a required parameter");

    this.who = options.who;
    this.type = options.type;

    if (options.type === ActionType.UseItem) {
      if (options.item === undefined)
        throw new Error("CombatActionProps: 'item' is a required parameter for UseItem action");
      this.item = options.item;
    }
  }
}

/**
 * Enum for creating actions in combat.
 * Each action is a function that returns a CombatActionProps object describing the action.
 **/
export const CombatAction = {
  Attack: (who, weapon, targets) => {
    return new CombatActionProps({
      type: ActionType.Attack,
      who,
      weapon,
      targets,
    });
  },
  Retreat: (entity) => {
    return new CombatActionProps({
      who: entity,
      type: ActionType.Retreat,
    });
  },
  Ability: (who, ability, targets = null) => {
    return new CombatActionProps({
      who: who,
      type: ActionType.Ability,
      ability,
      targets,
    });
  },
  UseItem: (who, item) => {
    return new CombatActionProps({
      who: who,
      type: ActionType.UseItem,
      item: item,
    });
  },
};

class BaseResult {
  constructor(target) {
    this.target = target;
  }
}

class AttackHitResult extends BaseResult {
  constructor(target, damage) {
    super(target);
    this.damage = damage;
  }
}

class AbilityHitResult extends BaseResult {
  constructor(target, status) {
    super(target);
    this.status = status;
  }
}

class RetreatResult extends BaseResult {
  constructor(target, successBoolean) {
    super(target);
    this.success = successBoolean;
  }
}
/**
 * Result of using an item in combat
 * @param {Entity} target - target of the item, for now it's always the player
 * @param {{stat: string, change: number}} effect - effect of the item,
 * the change in the stat of the target
 */
class UseItemResult extends BaseResult {
  constructor(target, effects) {
    super(target);

    /**
     * Effects of the item
     * @type {Array<Array<string, number>>}
     * @example [['health', 10], ['accuracy', 15]]
     */
    this.effects = effects;
  }
}

export const AttackType = {
  Standard: "Standard",
  Strong: "Strong",
  Area: "Area",
};

export class Combat {
  /**
   * @param {Player} player
   * @param {Npc[]} allies
   * @param {Npc} mainEnemy
   * @param {Npc[]} enemies
   * @param {Difficulty} difficulty
   **/
  constructor(player, allies, mainEnemy, enemies, combatConfig) {
    this.player = player;
    this.allies = allies;
    this.mainEnemy = mainEnemy;
    this.enemies = enemies;
    this.config = combatConfig;

    this.orderedByTurn = this._determineTurnOrder([player, ...allies], [mainEnemy, ...enemies]);

    this.reset();

    this.executorMap = new Map([
      [ActionType.Attack, this._executeAttack],
      [ActionType.Retreat, this._executeRetreat],
      [ActionType.Ability, this._executeAbility],
      [ActionType.UseItem, this._executeUseItem],
    ]);
  }

  reset() {
    this.turnIndex = 0;
  }

  /**
   * Sort combatants by speed (temporarily no sorting)
   @returns {Entity[]} Array of combatants sorted by speed
   **/
  _determineTurnOrder(allies, enemies) {
    return [allies, enemies].flat();
  }

  /**
   * Interface for mutating Combat state
   * Mutates combat state according to the given action
   @param {CombatActionProps} action action describing an event in combat
   @returns {BaseResult[]} results of the executed actions
   **/
  executeAction(action) {
    const entityAtTurn = this.orderedByTurn[this.turnIndex];
    if (entityAtTurn !== action.who)
      throw new Error(
        "Attempt to execute an action out of turn.\n" +
          `Expected: ${entityAtTurn.name}, got: ${action.who.name}\n` +
          `Turn index: ${this.turnIndex}, ` +
          `turn order: [${this.orderedByTurn.map((e) => e.name).join(",")}]`,
      );

    const actionResults = this.executorMap.get(action.type)(action);

    this.nextTurn();

    return actionResults;
  }

  nextTurn() {
    this.turnIndex = ++this.turnIndex % this.orderedByTurn.length;
  }

  /**
   * Given a weapon and an AttackType, determine which minigame needs to be run
   @param {Weapon} weapon weapon of the attacker
   @param {AttackType} attackType
   @returns {MiniGame} minigame that needs to be run
  **/
  getMinigame(_weapon, _attackType) {}

  /** @this {void} */
  _executeAttack({ targets }) {
    return targets.map((t) => {
      return new AttackHitResult(t, randIntInRange(5, 30));
    });
  }
  /** @this {void} */
  _executeRetreat({ who }) {
    return new RetreatResult(who, !!Math.round(Math.random()));
  }
  /** @this {void} */
  _executeAbility({ targets }) {
    return targets.map((t) => {
      return new AbilityHitResult(t, null);
    });
  }
  /** @this {void} */
  _executeUseItem({ who, item }) {
    return new UseItemResult(who, item.effects);
  }

  /**
   * CombatDisplay uses it to know when to show an action menu
   * @returns {boolean} boolean - is it the Player's turn?
   **/
  isPlayersTurn() {
    return this.orderedByTurn[this.turnIndex] instanceof Player;
  }
}

/**
   1. Gracz wybiera akcję w menu
   2. CombatDisplay pyta Combat jaką minigierkę wykonać (opt.)
   3. CombatDisplay przeprowadza wskazaną minigierkę (opt.)
   4. CombatDisplay podaje zdefiniowaną w ten sposób akcję (np Atak A -> B bronią K z wynikiem minigierki X) do Combata
   5. Combat oblicza swój nowy stan
   6. CombatDisplay wyświetla nowy stan
 **/
