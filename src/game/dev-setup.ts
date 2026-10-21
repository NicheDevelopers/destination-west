import { stateManager } from "@/engine/stateManager";
import Npc from "@/game/Entity/Npc";
import Container from "@/game/Entity/Container";
import Portal, { PortalType } from "@/game/Entity/Portal";
import Interactible from "@/game/Entity/Interactible";
import Trader from "@/game/Entity/Trader";
import ChuckALuck from "@/game/minigames/ChuckALuck";
import revolverShoot from "@/game/minigames/battleMinigames/RevolverShootingGame";
import revolverLoad from "@/game/minigames/battleMinigames/RevolverLoadingGame";
import { Combat, CombatConfig, CombatInitiationType, Difficulty } from "@/game/Combat/Combat";
import CombatDisplay from "@/game/Combat/CombatDisplay";
import { items } from "./items";
import {
  FindQuestBuilder,
  FindQuestConfig,
  FindQuestType,
  ItemDistribution,
  ItemEntry,
} from "./Quest";
import type Game from "./Game";

export function devSetup(game: Game): void {
  const town = game.currentTown;

  const testMinigame = new ChuckALuck(game);
  const testMinigamer = new Interactible(game, "chuck-a-luck-table", { x: 200, y: 200 });
  testMinigamer.interact = () => {
    testMinigame.start();
  };

  const testShooting = new revolverShoot(game, 6);
  const testTarget = new Interactible(game, "torso", { x: 100, y: 100 });
  testTarget.interact = () => {
    stateManager.toggleState(testShooting);
  };
  town.npcs.push(testTarget);

  const testLoading = new revolverLoad(game, 6);
  const testLoader = new Interactible(game, "torso", { x: 164, y: 100 });
  testLoader.interact = () => {
    stateManager.toggleState(testLoading);
  };
  town.npcs.push(testLoader);

  const testContainer = new Container(game, "barrel", { x: 250, y: 250 });
  testContainer.equipment.fillRecords([
    { recipe: items.whisky, quantity: 3 },
    { recipe: items.apple, quantity: 3 },
    { recipe: items.brokenBottle, quantity: 1 },
    { recipe: items.revolver1, quantity: 3 },
  ]);

  town.portals.push(
    new Portal(game, "decoration-roadsign", { x: 64 * 4, y: 64 * 5 }, PortalType.openMap()),
  );
  town.containers.push(testContainer);
  town.npcs.push(testMinigamer);
  const olBenjamin = new Npc(game, { x: 382, y: 350 }, "Ol' Benjamin");
  town.npcs.push(olBenjamin);
  olBenjamin.impaired = true;

  const testTrader = new Trader(game, { x: 300, y: 250 }, "Sawyer McCleary");
  testTrader.equipment.fillRecords([
    { recipe: items.apple, quantity: 3 },
    { recipe: items.revolver1, quantity: 5 },
  ]);

  const type = FindQuestType.FindOnTheGround;
  const distribution = ItemDistribution.Even;
  const entries = [new ItemEntry(items.apple, 5), new ItemEntry(items.brokenBottle, 3)];
  const questConfig = new FindQuestConfig(type, entries, distribution);
  const builder = new FindQuestBuilder(testTrader, questConfig, null);
  builder.validate();
  builder.build();

  town.npcs.push(testTrader);

  game.player.equipment.fillRecords([
    { recipe: items.cigar, quantity: 1 },
    { recipe: items.whisky, quantity: 5 },
    { recipe: items.revolver1, quantity: 2 },
    { recipe: items.revolver2, quantity: 3 },
    { recipe: items.apple, quantity: 5 },
    { recipe: items.brokenBottle, quantity: 1 },
  ]);

  const milas = new Npc(game, { x: 370, y: 290 }, "Milas");
  town.npcs.push(milas);

  const initType = CombatInitiationType.Normal;
  const difficulty = new Difficulty();
  const config = new CombatConfig(initType, difficulty);
  const combat = new Combat(game.player, [olBenjamin], milas, [], config);
  const combatDisplay = new CombatDisplay(game, combat);

  milas.interact = () => {
    combatDisplay.reset();
    stateManager.startState(combatDisplay);
  };
}
