import { useEffect, useRef, useMemo } from "react";
import { useGameStore } from "./gameStore";

const weights = {
  rootBeer: 1.5,
  weiner: 1,
  burger: 1,
};

// interface GameState {
//   rootBeers: number;
//   weiners: number;
//   burgers: number;
//   hunger: number;
//   thirst: number;
//   walkingSkill: number;
//   carryingSkill: number;
//   location: { x: number; y: number; z: number } | null;
//   cameraLocation: { x: number; y: number; z: number } | null;
//   scene: string;
// }

export function useGame(iframeRef: React.RefObject<HTMLIFrameElement>) {
  const rootBeers = useGameStore((state) => state.rootBeers);
  const weiners = useGameStore((state) => state.weiners);
  const burgers = useGameStore((state) => state.burgers);
  const hunger = useGameStore((state) => state.hunger);
  const thirst = useGameStore((state) => state.thirst);
  const walkingSkill = useGameStore((state) => state.walkingSkill);
  const carryingSkill = useGameStore((state) => state.carryingSkill);

  const carriedWeight = useMemo(() => {
    return (
      rootBeers * weights.rootBeer +
      weiners * weights.weiner +
      burgers * weights.burger
    );
  }, [rootBeers, weiners, burgers]);

  const unburdenedWeight = 20 + carryingSkill * 10;

  // slow tick simulates passive metabolism
  const intervalRef = useRef<number | null>(null);
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const burden = Math.max(0, carriedWeight - unburdenedWeight);

      // const metabolism = Math.max(
      //   Math.min(100, (0.01 * glucose + 0.01 * hunger + 0.01 * thirst) / 3),
      //   1
      // );

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

      console.log({
        metabolismFactor,
        burdenSpeedBurn,
      });

      const playerSpeed = Math.max(
        minimumSpeed,
        metabolismFactor * (baseWalkSpeed + skillSpeedBoost) +
          quenchedSpeedBoost -
          burdenSpeedBurn
      );

      useGameStore.setState((state) => ({
        hunger: Math.max(Math.min(100, state.hunger + hungerDelta), 0),
        thirst: Math.max(Math.min(100, state.thirst + thirstDelta), 0),
        carryingSkill: state.carryingSkill + Math.max(0, carryingSkillDelta),
        speed: playerSpeed,
        weight: carriedWeight,
      }));
      const iframe = iframeRef.current;
      if (!iframe) return;

      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow) return;

      const message = {
        type: "godot_set_player_speed",
        payload: playerSpeed,
      };

      const serializedMessage = JSON.stringify(message);
      iframeWindow.postMessage(serializedMessage, "*");
    }, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  });
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
