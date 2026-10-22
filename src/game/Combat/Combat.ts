import Player from "@/game/Entity/Player";
import type Npc from "@/game/Entity/Npc";
import type Weapon from "@/game/Item/Weapon";
import type Consumable from "@/game/Item/Consumable";
import type { RecipeConsumable } from "@/game/items";
import { randIntInRange } from "@/lib/random";

type Combatant = Player | Npc;

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
} as const;

type CombatInitiationType = (typeof CombatInitiationType)[keyof typeof CombatInitiationType];

export class CombatConfig {
  initiation: CombatInitiationType;
  difficulty: Difficulty;

  constructor(initiationType: CombatConfig["initiation"], difficulty: CombatConfig["difficulty"]) {
    this.initiation = initiationType;
    this.difficulty = difficulty;
  }
}
////////////// END Combat Config //////////

interface AttackAction {
  type: "Attack";
  who: Combatant;
  weapon: Weapon;
  targets: Combatant[];
}

interface RetreatAction {
  type: "Retreat";
  who: Combatant;
}

interface AbilityAction {
  type: "Ability";
  who: Combatant;
  ability: string;
  targets: Combatant[];
}

interface UseItemAction {
  type: "UseItem";
  who: Combatant;
  item: RecipeConsumable;
}

type CombatActionProps = AttackAction | RetreatAction | AbilityAction | UseItemAction;

/**
 * Enum for creating actions in combat.
 * Each action is a function that returns a CombatActionProps object describing the action.
 **/
export const CombatAction = {
  Attack: (who: Combatant, weapon: Weapon, targets: Combatant[]): AttackAction => {
    return { type: "Attack", who, weapon, targets };
  },
  Retreat: (who: Combatant): RetreatAction => {
    return { type: "Retreat", who };
  },
  Ability: (who: Combatant, ability: string, targets: Combatant[] = []): AbilityAction => {
    return { type: "Ability", who, ability, targets };
  },
  UseItem: (who: Combatant, item: RecipeConsumable): UseItemAction => {
    return { type: "UseItem", who, item };
  },
};

class BaseResult {
  target: Combatant;

  constructor(target: BaseResult["target"]) {
    this.target = target;
  }
}

class AttackHitResult extends BaseResult {
  damage: number;

  constructor(target: AttackHitResult["target"], damage: AttackHitResult["damage"]) {
    super(target);
    this.damage = damage;
  }
}

class AbilityHitResult extends BaseResult {
  status: null;

  constructor(target: AbilityHitResult["target"], status: AbilityHitResult["status"]) {
    super(target);
    this.status = status;
  }
}

class RetreatResult extends BaseResult {
  success: boolean;

  constructor(target: RetreatResult["target"], success: RetreatResult["success"]) {
    super(target);
    this.success = success;
  }
}
/**
 * Result of using an item in combat
 * @param target - target of the item, for now it's always the player
 * @param effects - effects of the item, the changes in the stats of the target
 */
class UseItemResult extends BaseResult {
  /**
   * Effects of the item
   * @example [['health', 10], ['accuracy', 15]]
   */
  effects: Consumable["effects"];

  constructor(target: UseItemResult["target"], effects: UseItemResult["effects"]) {
    super(target);
    this.effects = effects;
  }
}

export const AttackType = {
  Standard: "Standard",
  Strong: "Strong",
  Area: "Area",
} as const;

export class Combat {
  player: Player;
  allies: Npc[];
  mainEnemy: Npc;
  enemies: Npc[];
  config: CombatConfig;
  orderedByTurn: Combatant[];
  turnIndex = 0;

  constructor(
    player: Combat["player"],
    allies: Combat["allies"],
    mainEnemy: Combat["mainEnemy"],
    enemies: Combat["enemies"],
    combatConfig: Combat["config"],
  ) {
    this.player = player;
    this.allies = allies;
    this.mainEnemy = mainEnemy;
    this.enemies = enemies;
    this.config = combatConfig;

    this.orderedByTurn = this.determineTurnOrder([player, ...allies], [mainEnemy, ...enemies]);
  }

  reset(): void {
    this.turnIndex = 0;
  }

  /**
   * Sort combatants by speed (temporarily no sorting)
   @returns Array of combatants sorted by speed
   **/
  private determineTurnOrder(allies: Combatant[], enemies: Combatant[]): Combatant[] {
    return [...allies, ...enemies];
  }

  /**
   * Interface for mutating Combat state
   * Mutates combat state according to the given action
   @param action action describing an event in combat
   @returns results of the executed actions
   **/
  executeAction(action: AttackAction): AttackHitResult[];
  executeAction(action: RetreatAction): RetreatResult;
  executeAction(action: AbilityAction): AbilityHitResult[];
  executeAction(action: UseItemAction): UseItemResult;
  executeAction(action: CombatActionProps): BaseResult | BaseResult[] {
    const entityAtTurn = this.orderedByTurn[this.turnIndex];
    if (entityAtTurn !== action.who)
      throw new Error(
        "Attempt to execute an action out of turn.\n" +
          `Expected: ${entityAtTurn.name}, got: ${action.who.name}\n` +
          `Turn index: ${this.turnIndex}, ` +
          `turn order: [${this.orderedByTurn.map((e) => e.name).join(",")}]`,
      );

    const actionResults = this.execute(action);

    this.nextTurn();

    return actionResults;
  }

  private execute(action: CombatActionProps): BaseResult | BaseResult[] {
    switch (action.type) {
      case "Attack":
        return action.targets.map((target) => new AttackHitResult(target, randIntInRange(5, 30)));
      case "Retreat":
        return new RetreatResult(action.who, Math.random() < 0.5);
      case "Ability":
        return action.targets.map((target) => new AbilityHitResult(target, null));
      case "UseItem":
        return new UseItemResult(action.who, action.item.effects);
    }
  }

  nextTurn(): void {
    this.turnIndex = (this.turnIndex + 1) % this.orderedByTurn.length;
  }

  /**
   * CombatDisplay uses it to know when to show an action menu
   * @returns is it the Player's turn?
   **/
  isPlayersTurn(): boolean {
    return this.orderedByTurn[this.turnIndex] instanceof Player;
  }
}

/**
   1. The player picks an action in the menu
   2. CombatDisplay asks Combat which minigame to run (optional)
   3. CombatDisplay runs that minigame (optional)
   4. CombatDisplay passes the resulting action to Combat (e.g. Attack A -> B with weapon K and minigame result X)
   5. Combat computes its new state
   6. CombatDisplay displays the new state
 **/
