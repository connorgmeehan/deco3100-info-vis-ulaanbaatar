export default function getPosition(element) {
  let xPosition = 0;
  let yPosition = 0;

  while (element) {
      xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
      yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
      // eslint-disable-next-line no-param-reassign
      element = element.offsetParent;
  }

  return { x: xPosition, y: yPosition };
}
