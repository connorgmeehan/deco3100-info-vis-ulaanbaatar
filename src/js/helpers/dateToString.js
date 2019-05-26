const MON = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export default function dateToString(utc) {
  const date = new Date(utc);
  return {
    year: date.getFullYear(),
    month: MON[date.getMonth()],
    day: date.getDate(),
  }
}
