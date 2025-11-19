export function getTargetUtcTime(): string {
  const now = new Date();

  // Define today's 10:30 AM
  const today1030 = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 10, 30)
  );

  // Define today's 22:30
  let target = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 22, 30)
  );

  // If current time is after 10:30, move target to next day
  if (now.getTime() >= today1030.getTime()) {
    target = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 22, 30)
    );
  }

  return target.toISOString(); // Final UTC timestamp
}
