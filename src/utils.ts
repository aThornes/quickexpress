const getNumFromString = (str: string): number => {
  if (str === null) return 0;
  const numericVal = str.match(/\d+/);
  if (numericVal !== null) return Number(numericVal[0]);
  return 0;
};

export const getTimeFromString = (value: string | number): number => {
  if (typeof value === 'number') return value;
  let valDuration = getNumFromString(value);

  if (typeof value === 'string') {
    if (value.includes('m')) valDuration *= 60;
    else if (value.includes('h')) valDuration *= 3600;
    else if (value.includes('d')) valDuration *= 3600 * 24;
    else if (value.includes('w')) valDuration *= 3600 * 24 * 7;
    else if (value.includes('y')) valDuration *= 3600 * 24 * 365.25;
  }

  return valDuration;
};
