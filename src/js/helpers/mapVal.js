export default function mapVal(val, inMin, inMax, outMin, outMax) {
    return outMin + (val - inMin) * (outMax - outMin) / (inMax - inMin);
}
