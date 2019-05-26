import clamp from 'clamp';
import mapVal from './mapVal';

class ProgressScaler {
  startVal;
  endVal;
  onStart;
  onEnd;

  shouldClamp = false;

  constructor(startVal, endVal, onStart, onEnd) {
    this.startVal = startVal;
    this.endVal = endVal;
    this.onStart = onStart;
    this.onEnd = onEnd;
  }

  calculate(progress) {
    if (this.shouldClamp) {
      return clamp(mapVal(progress, this.startVal, this.endVal, -0.1, 1.1), -0.1, 1.1);
    } 
    return mapVal(progress, this.startVal, this.endVal, -0.1, 1.1);
  }

  setClamp(shouldClamp) {
    this.shouldClamp = shouldClamp;
  }
}

export default ProgressScaler;
