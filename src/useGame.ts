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

const weights = {
  root_beer: 1.5,
  weiner: 1,
  burger: 1,
};

const consumption_rates = {
  root_beer: 0.1,
  weiner: 0.2,
  burger: 0.05,
};

const consumption_effects = {
  root_beer: {
    hunger: 0,
    thirst: -10,
  },
  weiner: {
    hunger: -10,
    thirst: 2,
  },
  burger: {
    hunger: -20,
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
      console.log("from godot", event.data);
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

        // TODO: increase hunger and thirst based on distance traveled
        console.log("traveled", distance);
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

  return {
    ...oldState,
    hunger: clamp(hunger + hungerDelta, 0, 100),
    thirst: clamp(thirst + thirstDelta, 0, 100),
    carryingSkill: Math.max(0, carryingSkill + carryingSkillDelta),
    speed: playerSpeed,
    weight: carriedWeight,
  };
}
