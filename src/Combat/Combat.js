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

/**
 * Configuration for starting a Combat instance
 **/
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

/**
 * Enum listing possible actions for an Entity in combat.
 **/
const ActionType = {
  Attack: "Attack",
  Retreat: "Retreat",
  Ability: "Ability",
  UseItem: "UseItem",
};

/**
 *
 **/
export const CombatAction = {
  Attack: (who, weapon, targets) => {
    return {
      type: ActionType.Attack,
      who,
      weapon,
      targets,
    };
  },
  Retreat: (entity) => {
    return {
      type: ActionType.Retreat,
      entity,
    };
  },
  Ability: (who, ability, targets = null) => {
    return {
      type: ActionType.Ability,
      who,
      ability,
      targets,
    };
  },
  UseItem: (who, item, targets = null) => {
    return {
      type: ActionType.UseItem,
      who,
      item,
      targets,
    };
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
class UseItemResult extends BaseResult {
  constructor(target, effect) {
    super(target);
    this.effect = effect;
  }
}

export const AttackType = {
  Standard: "Standard",
  Strong: "Strong",
  Area: "Area",
};

export class Combat {
  /**
  @param {Player} player
  @param {Npc[]} allies
  @param {Npc[]} enemies
  @param {Difficulty} difficulty
   **/
  constructor(player, allies, enemies, combatConfig) {
    this.player = player;
    this.allies = allies;
    this.enemies = enemies;
    this.config = combatConfig;

    this.orderedByTurn = this._determineTurnOrder([player, ...allies], enemies);
    this.turnIndex = 0;

    this.executorMap = new Map([
      [ActionType.Attack, this._executeAttack],
      [ActionType.Retreat, this._executeRetreat],
      [ActionType.Ability, this._executeAbility],
      [ActionType.UseItem, this._executeUseItem],
    ]);
  }

  /**
   * Sort combatants by speed (temporarily by ID)
   @returns {Entity[]} Array of combatants sorted by speed
   **/
  _determineTurnOrder(allies, enemies) {
    return [allies, enemies].flat().sort((a, b) => a.id - b.id);
  }

  /**
   * Interface for mutating Combat state
   * Mutates combat state according to the given action
   @param {CombatAction} action action describing an event in combat
   @returns {BaseResult[]} results of the executed actions
   **/
  executeAction(action) {
    const entityAtTurn = this.orderedByTurn[this.turnIndex];
    if (entityAtTurn !== action.who) null;
    //throw "Attempt to execute an action out of turn";
    console.log(`executing`, action);

    const actionResults = this.executorMap.get(action.type)(action); // execute the action

    this.turnIndex = ++this.turnIndex % this.orderedByTurn.length; // loop around

    return actionResults;
  }
  /**
   * Given a weapon and an AttackType, determine which minigame needs to be run
   @param {Weapon} weapon weapon of the attacker
   @param {AttackType} attackType
   @returns {MiniGame} minigame that needs to be run
  **/
  getMinigame(weapon, attackType) {}

  _executeAttack({ _, who, weapon, targets }) {
    return targets.map((t) => {
      return new AttackHitResult(t, randIntInRange(5, 30));
    });
  }
  _executeRetreat({ _, who }) {
    return new RetreatResult(who, !!Math.round(Math.random()));
  }
  _executeAbility({ _, who, ability, targets }) {
    return targets.map((t) => {
      return new AbilityHitResult(t, null);
    });
  }
  _executeUseItem({ _, who, item, targets }) {
    return targets.map((t) => {
      return new UseItemResult(t, null);
    });
  }

  /**
   * CombatDisplay uses it to know when to show an action menu
   @returns {boolean} boolean - is it the Player's turn?
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
