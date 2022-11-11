export default (val: string | number | Date) => {
  const date = new Date(val);
  const [minutes, seconds] = [date.getMinutes(), date.getSeconds()];

  return `${minutes}:${`${seconds}`.padStart(2, '0')}`;
};
