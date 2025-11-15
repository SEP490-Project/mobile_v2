import { useEffect, useState } from "react";

export function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(getCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getCountdown(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function getCountdown(targetDate: Date) {
  const now = new Date();
  const target = new Date(targetDate);

  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diffMs % (1000 * 60)) / 1000),
  };
}
