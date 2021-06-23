const isNew = (old, current) => (key) => old[key] !== current[key];
const isGone = (old, current) => (key) => !(key in current);
const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);

export { isProperty, isNew, isGone, isEvent };
