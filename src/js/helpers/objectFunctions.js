function filterKeys(obj, allowed) {
  return Object.entries(obj).filter((item) => {
    console.log(item);
    // eslint-disable-next-line no-named-as-default
    return allowed.includes(item[0])
  });
}

export default filterKeys;
