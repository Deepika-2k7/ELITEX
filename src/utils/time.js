/**
 * Time utility functions for Asia/Kolkata (IST: UTC+5:30)
 */

export function calculateTimeRemaining(targetIsoString) {
  const targetTime = new Date(targetIsoString).getTime();
  const now = Date.now();
  const difference = targetTime - now;

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalRemainingMs: 0,
      isPassed: true
    };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / 1000 / 60) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    totalRemainingMs: difference,
    isPassed: false
  };
}
