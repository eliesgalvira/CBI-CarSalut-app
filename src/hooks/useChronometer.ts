import { useCallback, useRef, useState } from 'react';

export interface ChronometerState {
  elapsedTime: number; // milliseconds
  isRunning: boolean;
}

export function useChronometer() {
  const [state, setState] = useState<ChronometerState>({
    elapsedTime: 0,
    isRunning: false,
  });

  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (state.isRunning) return;

    startTimeRef.current = Date.now() - state.elapsedTime;
    setState((prev) => ({ ...prev, isRunning: true }));

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current !== null) {
        setState((prev) => ({
          ...prev,
          elapsedTime: Date.now() - startTimeRef.current!,
        }));
      }
    }, 10); // Update every 10ms for smooth display
  }, [state.isRunning, state.elapsedTime]);

  const stop = useCallback(() => {
    if (!state.isRunning) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setState((prev) => ({ ...prev, isRunning: false }));
  }, [state.isRunning]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
    setState({ elapsedTime: 0, isRunning: false });
  }, []);

  // Format elapsed time as MM:SS.ms
  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    ...state,
    formattedTime: formatTime(state.elapsedTime),
    start,
    stop,
    reset,
  };
}
