import {
  GameState,
  ActionMessageSchema,
  ActionMessage,
  WorkerMessage,
  EatBurgerMessage,
  UpdateStateMessage,
  EatWeinerMessage,
  DrinkRootBeerMessage,
  PickUpAction,
  GotoAction,
} from "../schema";
import { useGameStore } from "../store/gameStore";

const connections: MessagePort[] = [];

onconnect = function (e) {
  const port = e.ports[0];
  connections.push(port);

  port.onmessage = function (event) {
    try {
      const message = ActionMessageSchema.parse(event.data);
      handleActionMessage(message);
    } catch (error) {
      console.error("Invalid message received:", error);
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

// const gameState: GameState = {
//   rootBeers: 0,
//   weiners: 0,
//   burgers: 0,
//   hunger: 50,
//   thirst: 50,
//   walkingSkill: 0,
//   carryingSkill: 0,
//   speed: 0,
//   weight: 0,
//   location: null,
//   cameraLocation: null,
//   scene: null,
// };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// function handleActionMessage(message: ActionMessage) {
//   switch (message.type) {
//     case "update_state":
//       // Handle state updates from clients if needed
//       Object.assign(gameState, message.payload);
//       break;
//     case "eat_burger":
//       // eslint-disable-next-line no-var
//       var delta = message.payload ?? 1;
//       // eslint-disable-next-line no-var
//       var newBurgers = gameState.burgers + delta;
//       if (newBurgers >= 0) {
//         gameState.burgers = newBurgers;
//         gameState.hunger = clamp(gameState.hunger - 20 * delta, 0, 100);
//         broadcastState();
//       }
//       break;
//     case "eat_weiner":
//       // eslint-disable-next-line no-var
//       var delta = message.payload ?? 1;
//       // eslint-disable-next-line no-var
//       var newWeiners = gameState.weiners + delta;
//       if (newWeiners >= 0) {
//         gameState.weiners = newWeiners;
//         gameState.hunger = clamp(gameState.hunger - 10 * delta, 0, 100);
//         broadcastState();
//       }
//       break;
//     case "drink_root_beer":
//       // eslint-disable-next-line no-var
//       var delta = message.payload ?? 1;
//       // eslint-disable-next-line no-var
//       var newRootBeers = gameState.rootBeers - delta;
//       if (newRootBeers >= 0) {
//         gameState.rootBeers = newRootBeers;
//         gameState.thirst = clamp(gameState.thirst - 10 * delta, 0, 100);
//         broadcastState();
//       }
//       break;
//     case "pick_up":
//       // eslint-disable-next-line no-var
//       var { type, quantity } = message.payload;
//       switch (type) {
//         case "BURGER":
//           gameState.burgers += quantity;
//           break;
//         case "WEINER":
//           gameState.weiners += quantity;
//           break;
//         case "ROOT_BEER":
//           gameState.rootBeers += quantity;
//           break;
//       }
//       break;
//     default:
//       console.error("Unknown action type:", message.type);
//   }
// }

const messageHandlers = {
  go_to: (message: GotoAction) => {
    
    

  update_state: (message: UpdateStateMessage) => {
    useGameStore.setState(message.payload);
    return {
      broadcastState: true,
    };
  },
  eat_burger: (message: EatBurgerMessage) => {
    const currentBurgers = useGameStore.getState().burgers;
    const delta = message.payload ?? -1;
    const newBurgers = currentBurgers + delta;
    if (newBurgers >= 0) {
      useGameStore.setState((state: GameState) => ({
        ...state,
        burgers: newBurgers,
        hunger: clamp(state.hunger - 20 * delta, 0, 100),
      }));
    }
    return {
      broadcastState: true,
    };
  },
  eat_weiner: (message: EatWeinerMessage) => {
    const currentWeiners = useGameStore.getState().weiners;
    const delta = message.payload ?? -1;
    const newWeiners = currentWeiners + delta;
    if (newWeiners >= 0) {
      useGameStore.setState((state: GameState) => ({
        ...state,
        weiners: newWeiners,
        hunger: clamp(state.hunger - 10 * delta, 0, 100),
      }));
    }
  },
  drink_root_beer: (message: DrinkRootBeerMessage) => {
    const currentRootBeers = useGameStore.getState().rootBeers;
    const delta = message.payload ?? -1;
    const newRootBeers = currentRootBeers - delta;
    if (newRootBeers >= 0) {
      useGameStore.setState((state: GameState) => ({
        ...state,
        rootBeers: newRootBeers,
        thirst: clamp(state.thirst - 10 * delta, 0, 100),
      }));
    }
  },
  pick_up: (message: PickUpAction) => {
    const { type, quantity } = message.payload;

    useGameStore.setState((state: GameState) => {
      switch (type) {
        case "BURGER":
          return {
            ...state,
            burgers: state.burgers + quantity,
          };
        case "WEINER":
          return {
            ...state,
            weiners: state.weiners + quantity,
          };
        case "ROOT_BEER":
          return {
            ...state,
            rootBeers: state.rootBeers + quantity,
          };
        default:
          return state;
      }
    });
  },
};

const handleActionMessage = (message: ActionMessage) => {
  const handler = messageHandlers[message.type];
  if (handler) {
    handler(message);
  } else {
    console.error("Unknown action type:", message.type);
  }
};

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
  broadcastState();
}

function broadcastState() {
  const message: WorkerMessage = {
    type: "update",
    payload: gameState,
  };
  connections.forEach((port) => {
    port.postMessage(message);
  });
}

// Start the interval to update the game state every second
setInterval(updateGameState, 1000);
