import { useState, useEffect } from "react";

export default function useCountdown(targetDate) {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(targetDate) - new Date();

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (60 * 60 * 24));
      const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor(((totalSeconds % (60 * 60 * 24)) % (60 * 60)) / 60);
      const seconds = totalSeconds % 60;

      setTime({
        days,
        hours,
        minutes,
        seconds,
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [targetDate]);

  return time;
}