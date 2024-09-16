import { useEffect, useCallback, useMemo, useState } from "react";
import { useGameStore } from "./store/gameStore";
import {
  Consumable,
  GodotAction,
  GodotContextAction,
  Point3,
  TaskConsume,
} from "./schema";
import { GameState } from "./schema";
import { getXPStats } from "./getXPStats";
import { addXP } from "./addXP";

const weights = {
  root_beer: 2,
  weiner: 1,
  burger: 1.5,
};

const consumption_rates = {
  root_beer: 0.01,
  weiner: 0.01,
  burger: 0.005,
};

const consumption_effects = {
  root_beer: {
    hunger: 0,
    thirst: -25,
  },
  weiner: {
    hunger: -15,
    thirst: 2,
  },
  burger: {
    hunger: -40,
    thirst: 5,
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function useGame({
  iframeRef,
}: {
  iframeRef: React.RefObject<HTMLIFrameElement>;
}) {
  const sendMessageToGodot = useCallback(
    (message: GodotAction) => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow) return;

      const serializedMessage = JSON.stringify(message);
      iframeWindow.postMessage(serializedMessage, "*");
    },
    [iframeRef]
  );

  const [actions, setActions] = useState<GodotContextAction[]>([]);

  const [contextMenu, setContextMenu] = useState<{
    open: boolean;
    anchorPosition: { top: number; left: number } | null;
  }>({
    open: false,
    anchorPosition: null,
  });

  const closeContextMenu = useCallback(() => {
    setContextMenu((state) => ({
      ...state,
      open: false,
    }));
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;

      if (event.data.type === "godot_oncontextmenu") {
        setActions(event.data.actions);
        setContextMenu({
          open: true,
          anchorPosition: {
            top: event.data.screen_point.y / 1.5,
            left: event.data.screen_point.x / 1.5,
          },
        });
      } else if (event.data.type === "godot_onpickup") {
        const objectType = event.data.object_type;
        const quantity = event.data.quantity || 1;

        if (objectType === "root_beer") {
          useGameStore.setState((state) => ({
            root_beer: state.root_beer + quantity,
          }));
        } else if (objectType === "weiner") {
          useGameStore.setState((state) => ({
            weiner: state.weiner + quantity,
          }));
        } else if (objectType === "burger") {
          useGameStore.setState((state) => ({
            burger: state.burger + quantity,
          }));
        }
      } else if (event.data.type === "godot_camera_position_update") {
        const { x, y, z } = event.data.position;

        useGameStore.setState({ cameraLocation: { x, y, z } });
      } else if (event.data.type === "godot_location_update") {
        const { x, y, z } = event.data.position;

        useGameStore.setState({ location: { x, y, z } });
      } else if (event.data.type === "godot_travel") {
        const distance = event.data.distance;
        const burden = useGameStore.getState().burden;

        const xp = distance * (1 + burden / 100);
        const thirstDelta = (distance * (1 + burden / 100)) / 5;
        const hungerDelta = (distance * (1 + burden / 100)) / 5;

        useGameStore.setState((state) => {
          const newWalkingSkill = addXP(state.walkingSkill, xp);
          return {
            walkingSkill: newWalkingSkill,
            thirst: clamp(state.thirst + thirstDelta, 0, 100),
            hunger: clamp(state.hunger + hungerDelta, 0, 100),
          };
        });
      } else if (event.data.type === "godot_consume") {
        const time = event.data.time;

        const currentState = useGameStore.getState();

        if (currentState.task?.type === "consume") {
          const { consumable } = currentState.task;
          const rate = consumption_rates[consumable];
          const currentAmount = currentState[consumable];
          const amount = Math.min(rate * time, currentAmount);

          const newTask = {
            ...currentState.task,
            amount: currentState.task.amount - amount,
          } as TaskConsume;

          const effects = consumption_effects[consumable];

          useGameStore.setState((state) => ({
            [consumable]: state[consumable] - amount,
            hunger: state.hunger + (effects.hunger * amount || 0),
            thirst: state.thirst + (effects.thirst * amount || 0),
            task: newTask,
          }));
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [setActions, iframeRef]);

  // These functions set a task for the character
  const goToPoint = useCallback(
    (point: Point3) => {
      useGameStore.setState((state: GameState) => ({
        ...state,
        task: {
          type: "go_to_point",
          point,
        },
      }));
      sendMessageToGodot({
        action: "go_to_point",
        point,
      });
    },
    [sendMessageToGodot]
  );

  const goToObject = useCallback((id: string) => {
    useGameStore.setState((state: GameState) => ({
      ...state,
      task: {
        type: "go_to_object",
        object: id,
      },
    }));
  }, []);

  const pickUp = useCallback(
    (id: string) => {
      useGameStore.setState((state: GameState) => ({
        ...state,
        task: {
          type: "pick_up",
          object: id,
        },
      }));
      sendMessageToGodot({
        action: "pick_up",
        id,
      });
    },
    [sendMessageToGodot]
  );

  const consume = useCallback(
    (consumable: Consumable, maxAdditionalAmount: number) => {
      const currentState = useGameStore.getState();
      const currentAmount = currentState[consumable];

      let amount = Math.min(maxAdditionalAmount, currentAmount);

      // if the character is already consuming, add to the amount
      if (
        currentState.task?.type === "consume" &&
        currentState.task.consumable === consumable
      ) {
        amount += currentState.task.amount;
      }

      useGameStore.setState((state: GameState) => ({
        ...state,
        task: {
          type: "consume",
          consumable,
          amount,
        },
      }));

      sendMessageToGodot({
        action: "consume_consumable",
        consumable,
        amount,
        time_remaining: amount / consumption_rates[consumable],
      });

      return amount;
    },
    [sendMessageToGodot]
  );

  // 1 second tick
  useEffect(() => {
    const timer = setInterval(() => {
      const oldState = useGameStore.getState();
      const newState = updateGameState(oldState);

      if (oldState.speed !== newState.speed) {
        sendMessageToGodot({
          action: "set_player_speed",
          speed: newState.speed,
        });
      }
      useGameStore.setState(newState);
    }, 1000);

    return () => clearInterval(timer);
  }, [sendMessageToGodot]);

  return useMemo(() => {
    return {
      goToPoint,
      goToObject,
      pickUp,
      consume,
      actions,
      contextMenu,
      closeContextMenu,
    };
  }, [
    goToPoint,
    goToObject,
    pickUp,
    consume,
    actions,
    contextMenu,
    closeContextMenu,
  ]);
}

// One second tick update
function updateGameState(oldState: GameState): GameState {
  const {
    root_beer,
    weiner,
    burger,
    hunger,
    thirst,
    walkingSkill,
    carryingSkill,
  } = oldState;

  const carriedWeight =
    root_beer * weights.root_beer +
    weiner * weights.weiner +
    burger * weights.burger;

  const maximumCarryWeight = 20 + carryingSkill.level * 5;

  const unburdenedWeight = maximumCarryWeight * 0.2;

  const burden = Math.max(0, carriedWeight - unburdenedWeight);
  const maxBurden = maximumCarryWeight - unburdenedWeight;

  const thirstDelta = 0.001 + burden * 0.0001;
  const hungerDelta = 0.001 + burden * 0.001;
  const carryingSkillDelta = burden * 0.001;

  const quenched = clamp(100 - thirst, 0, 100) / 100;
  const satiated = clamp(100 - hunger, 0, 100) / 100;

  const minimumSpeed = 3 + 0.1 * walkingSkill.level;
  const maximumSpeed = 5 + 0.2 * walkingSkill.level;

  let speedMultiplier = quenched * satiated - burden / maxBurden / 2;
  console.log(speedMultiplier, quenched, satiated);

  let playerSpeed = minimumSpeed / 2;
  if (carriedWeight < maximumCarryWeight) {
    playerSpeed =
      minimumSpeed + (maximumSpeed - minimumSpeed) * speedMultiplier;
  } else {
    // multiplier for speed when carrying too much, this value is used in the UI
    speedMultiplier = 0;
  }

  const newCarryingSkill = addXP(carryingSkill, carryingSkillDelta);

  return {
    ...oldState,
    hunger: clamp(hunger + hungerDelta, 0, 100),
    thirst: clamp(thirst + thirstDelta, 0, 100),
    carryingSkill: newCarryingSkill,
    speed: playerSpeed,
    speedMultiplier,
    minimumSpeed,
    maximumSpeed,
    weight: carriedWeight,
    burden,
    maximumCarryWeight,
  };
}
