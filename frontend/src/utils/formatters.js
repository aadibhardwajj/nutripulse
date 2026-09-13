export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatCalories = (kcal) => {
  return `${formatNumber(kcal)} kcal`;
};

export const formatGrams = (g) => {
  return `${formatNumber(g, 1)}g`;
};

export const formatMilliliters = (ml) => {
  return `${formatNumber(ml)} ml`;
};
