import { useState, useEffect } from 'react';

export const useCountdown = (initialTime: number) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let intervalId = undefined;

    if (isActive && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => clearInterval(intervalId);
  }, [isActive, timeLeft]);

  const start = () => setIsActive(true);
  const pause = () => setIsActive(false);
  const reset = () => {
    setTimeLeft(initialTime);
    setIsActive(false);
  };

  return { timeLeft, isActive, start, pause, reset };
};