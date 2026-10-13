export function computeDateRange(daysAgo: number): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - daysAgo);
  return { startDate, endDate };
}
