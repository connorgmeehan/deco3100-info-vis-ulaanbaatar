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
    mon: MON[date.getMonth()],
  }
}
