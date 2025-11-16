export type RandomSource = () => number;

export const getRandomSource = (random?: RandomSource): RandomSource => {
  if (random) {
    return random;
  }
  return Math.random;
};

export const randomIndex = (length: number, random: RandomSource): number => {
  if (length <= 0) {
    return 0;
  }
  return Math.floor(random() * length);
};

export const randomBoolean = (random: RandomSource): boolean => random() < 0.5;

export const randomIntInclusive = (min: number, max: number, random: RandomSource): number => {
  if (max < min) {
    return min;
  }
  const range = max - min + 1;
  return min + Math.floor(random() * range);
};
