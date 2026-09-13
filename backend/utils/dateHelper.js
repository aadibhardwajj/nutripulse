// Utility to format and normalize dates (YYYY-MM-DD)
const formatDateString = (date = new Date()) => {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDaysInRange = (startDate, endDate) => {
  const dates = [];
  const curr = new Date(startDate);
  const end = new Date(endDate);
  while (curr <= end) {
    dates.push(formatDateString(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

const getPastDate = (daysAgo = 7) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return formatDateString(d);
};

module.exports = { formatDateString, getDaysInRange, getPastDate };
