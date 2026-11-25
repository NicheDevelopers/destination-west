import { stateManager } from "@/engine/state/StateManager";
import Npc from "@/game/Entity/Npc";
import Container from "@/game/Entity/Container";
import Portal, { PortalType } from "@/game/Entity/Portal";
import Interactible from "@/game/Entity/Interactible";
import Trader from "@/game/Entity/Trader";
import Treadmill from "@/game/Entity/Treadmill";
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
import type Location from "./Location/Location";
import type Tile from "@/engine/Tile";
import { TILE_SIZE } from "@/engine/consts";
import type { Point } from "@/lib/utilities";

/**
 * The middle of the pair of empty street tiles side by side that is nearest the
 * spawn point, preferring pairs with free street all around. Towns are random,
 * and only streets are free of decorations.
 */
function treadmillSpot(town: Location): Point {
  const spawn = {
    x: Math.floor(town.playerSpawn.x / TILE_SIZE),
    y: Math.floor(town.playerSpawn.y / TILE_SIZE),
  };
  const isFreeStreet = (tile: Tile) => tile.typeName !== "sand" && tile.entities.length === 0;
  const isFree = (column: number, row: number) => {
    const tile = town.tiles[column]?.[row];
    return tile !== undefined && isFreeStreet(tile);
  };
  let best = { ...spawn, distance: Infinity, roomy: false };
  for (let x = 0; x + 1 < town.tiles.length; x++) {
    for (let y = 0; y < town.tiles[0].length; y++) {
      if (!isFree(x, y) || !isFree(x + 1, y)) continue;
      if (y === spawn.y && (x === spawn.x || x + 1 === spawn.x)) continue;
      // Best with a free tile all around: the flywheel sticks out past the pair, and
      // when turned the treadmill reaches into the rows above and below
      const roomy = [y - 1, y, y + 1].every((row) =>
        [x - 1, x, x + 1, x + 2].every((column) => isFree(column, row)),
      );
      const distance = Math.hypot(x + 0.5 - spawn.x, y - spawn.y);
      if (roomy > best.roomy || (roomy === best.roomy && distance < best.distance)) {
        best = { x, y, distance, roomy };
      }
    }
  }
  return { x: (best.x + 1) * TILE_SIZE, y: best.y * TILE_SIZE + TILE_SIZE / 2 };
}

export function devSetup(game: Game): void {
  const town = game.currentTown;

  // For watching the player's walk and run animations in place
  town.npcs.push(new Treadmill(game, town, "horizontal", treadmillSpot(town)));

  const testMinigame = new ChuckALuck(game);
  const testChuckALuckTable = new Interactible(game, town, "chuck-a-luck-table", {
    x: 200,
    y: 200,
  });
  testChuckALuckTable.interact = () => {
    testMinigame.start();
  };

  const testShooting = new revolverShoot(game, 6);
  const testTarget = new Interactible(game, town, "torso", { x: 100, y: 100 });
  testTarget.interact = () => {
    stateManager.toggleState(testShooting);
  };
  town.npcs.push(testTarget);

  const testLoading = new revolverLoad(game, 6);
  const testLoader = new Interactible(game, town, "torso", { x: 164, y: 100 });
  testLoader.interact = () => {
    stateManager.toggleState(testLoading);
  };
  town.npcs.push(testLoader);

  const testContainer = new Container(game, town, "barrel", { x: 250, y: 250 });
  testContainer.equipment.fillRecords([
    { recipe: items.whisky, quantity: 3 },
    { recipe: items.apple, quantity: 3 },
    { recipe: items.brokenBottle, quantity: 1 },
    { recipe: items.revolver1, quantity: 3 },
  ]);

  town.portals.push(
    new Portal(game, town, "decoration-roadsign", { x: 64 * 4, y: 64 * 5 }, PortalType.openMap()),
  );
  town.containers.push(testContainer);
  town.npcs.push(testChuckALuckTable);
  const olBenjamin = new Npc(game, town, { x: 382, y: 350 }, "Ol' Benjamin");
  town.npcs.push(olBenjamin);
  olBenjamin.canMove = false;

  const testTrader = new Trader(game, town, { x: 300, y: 250 }, "Sawyer McCleary");
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

  const milas = new Npc(game, town, { x: 370, y: 290 }, "Milas");
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
