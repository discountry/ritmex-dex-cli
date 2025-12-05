export const downsampleSeries = (series: number[], maxPoints: number): number[] => {
  if (series.length <= maxPoints) return series;
  const step = series.length / maxPoints;
  const result: number[] = [];
  for (let index = 0; index < maxPoints; index += 1) {
    const sourceIndex = Math.floor(index * step);
    const safeIndex = Math.min(sourceIndex, series.length - 1);
    const value = series[safeIndex] ?? series[series.length - 1] ?? 0;
    result.push(value);
  }
  return result;
};
