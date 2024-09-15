import { useEffect, useCallback, useMemo } from "react";
import { useGameStore } from "./store/gameStore";
import { Consumable, GodotAction, Point3 } from "./schema";
import { GameState } from "./schema";

const weights = {
  root_beer: 1.5,
  weiner: 1,
  burger: 1,
};

const consumption_rates = {
  root_beer: 10,
  weiner: 5,
  burger: 15,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function useGame({
  sendMessageToGodot,
}: {
  sendMessageToGodot: (message: GodotAction) => void;
}) {
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
        time_remaining: consumption_rates[consumable] * amount,
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
    };
  }, [goToPoint, goToObject, pickUp, consume]);
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
