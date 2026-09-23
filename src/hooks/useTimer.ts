import * as React from "react";

export interface UseTimerOptions {
  initialSeconds?: number;
  mode?: "countdown" | "stopwatch";
  onExpire?: () => void;
  autoStart?: boolean;
}

export interface UseTimerReturn {
  seconds: number;
  isRunning: boolean;
  isPaused: boolean;
  formattedTime: string;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (newInitialSeconds?: number) => void;
}

/**
 * Hook para control de tiempo en exámenes y sesiones de estudio.
 * Soporta cuenta regresiva (countdown) y cronómetro progresivo (stopwatch) con pausa y reanudación.
 */
export function useTimer({
  initialSeconds = 0,
  mode = "countdown",
  onExpire,
  autoStart = false,
}: UseTimerOptions = {}): UseTimerReturn {
  const [seconds, setSeconds] = React.useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = React.useState<boolean>(autoStart);
  const [isPaused, setIsPaused] = React.useState<boolean>(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (mode === "countdown") {
            if (prev <= 1) {
              if (interval) clearInterval(interval);
              setIsRunning(false);
              onExpire?.();
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused, mode, onExpire]);

  const start = React.useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pause = React.useCallback(() => {
    if (isRunning) {
      setIsPaused(true);
    }
  }, [isRunning]);

  const resume = React.useCallback(() => {
    if (isRunning && isPaused) {
      setIsPaused(false);
    }
  }, [isRunning, isPaused]);

  const reset = React.useCallback(
    (newInitialSeconds?: number) => {
      setSeconds(newInitialSeconds !== undefined ? newInitialSeconds : initialSeconds);
      setIsRunning(false);
      setIsPaused(false);
    },
    [initialSeconds]
  );

  const formattedTime = React.useMemo(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [seconds]);

  return {
    seconds,
    isRunning,
    isPaused,
    formattedTime,
    start,
    pause,
    resume,
    reset,
  };
}
