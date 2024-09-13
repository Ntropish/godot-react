// src/gameWorker.js

const connections = [];

onconnect = function (e) {
  const port = e.ports[0];
  connections.push(port);

  port.onmessage = function (event) {
    const { type, payload } = event.data;
    if (type === "update_state") {
      // Handle state updates from clients if needed
      Object.assign(gameState, payload);
    }
  };

  // Send the initial game state to the connected client
  port.postMessage({ type: "initial_state", payload: gameState });
};

const weights = {
  rootBeer: 1.5,
  weiner: 1,
  burger: 1,
};

let gameState = {
  rootBeers: 0,
  weiners: 0,
  burgers: 0,
  hunger: 50,
  thirst: 50,
  walkingSkill: 0,
  carryingSkill: 0,
  speed: 0,
  weight: 0,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updateGameState() {
  const {
    rootBeers,
    weiners,
    burgers,
    hunger,
    thirst,
    walkingSkill,
    carryingSkill,
  } = gameState;

  const carriedWeight =
    rootBeers * weights.rootBeer +
    weiners * weights.weiner +
    burgers * weights.burger;

  const unburdenedWeight = 20 + carryingSkill * 10;

  const burden = Math.max(0, carriedWeight - unburdenedWeight);

  const metabolism = clamp(100 - hunger, 1, 100);

  const carryBurn = burden * 0.01;
  const thirstDelta = 0.001 + carryBurn * 0.0001;

  const hungerDelta = metabolism * 0.001;

  const carryingSkillDelta = carryBurn * 0.1;

  const baseWalkSpeed = 5;
  const skillSpeedBoost = 0.1 * walkingSkill;
  const quenchedSpeedBoost = (clamp(30 - thirst, 0, 100) / 30) * 3;
  const burdenSpeedBurn = 0.1 * burden;
  const metabolismFactor = metabolism / 100;

  const minimumSpeed = 0.5 + 0.01 * walkingSkill;

  const playerSpeed = Math.max(
    minimumSpeed,
    metabolismFactor * (baseWalkSpeed + skillSpeedBoost) +
      quenchedSpeedBoost -
      burdenSpeedBurn
  );

  // Update game state
  gameState.hunger = clamp(hunger + hungerDelta, 0, 100);
  gameState.thirst = clamp(thirst + thirstDelta, 0, 100);
  gameState.carryingSkill += Math.max(0, carryingSkillDelta);
  gameState.speed = playerSpeed;
  gameState.weight = carriedWeight;

  // Send the updated state to all connected clients
  connections.forEach((port) => {
    port.postMessage({ type: "update", payload: gameState });
  });
}

// Start the interval to update the game state every second
setInterval(updateGameState, 1000);
