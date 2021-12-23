export const sec2milli = (sec: number): number => {
  return sec * 1000;
};
export const dateTimeToDate = (dateTime: string): Date => {
  const milli = dateTime.replace(/\/Date\((-?\d+)\)\//, '$1');
  return new Date(parseInt(milli, 10));
};
