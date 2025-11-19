export function getTargetUtcTime(): string {
  const now = new Date();

  // 10:30 PM Bangladesh Time = 4:30 PM UTC (16:30)
  // Because Bangladesh is UTC+6
  const today1030PMBST = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 16, 30)
  );

  const target =
    now.getTime() >= today1030PMBST.getTime()
      ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 16, 30))
      : today1030PMBST;

  return target.toISOString();
}
