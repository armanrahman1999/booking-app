export function getTargetUtcTime(): string {
  const now = new Date();

  // 11:00 AM Bangladesh Time = 5:00 AM UTC (05:00)
  // Because Bangladesh is UTC+6
  const today1100AMBST = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 5, 0)
  );

  const target =
    now.getTime() >= today1100AMBST.getTime()
      ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 5, 0))
      : today1100AMBST;

  return target.toISOString();
}
