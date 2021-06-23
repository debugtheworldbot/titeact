import { isEvent, isGone, isNew, isProperty } from "./utils";

const updateDom = (dom, prevProps, newProps) => {
  // remove events
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in newProps) || isNew(prevProps, newProps)(key))
    .forEach((key) => {
      const event = key.toLowerCase().substring(2);
      dom.removeEventListener(event, prevProps[key]);
    });
  // remove old props
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, newProps))
    .forEach((name) => {
      dom[name] = "";
    });
  // add events
  Object.keys(newProps)
    .filter(isEvent)
    .filter(isNew(prevProps, newProps))
    .forEach((key) => {
      const event = key.toLowerCase().substring(2);
      dom.addEventListener(event, newProps[key]);
    });
  // add | set new props
  Object.keys(newProps)
    .filter(isProperty)
    .filter(isNew(prevProps, newProps))
    .forEach((name) => {
      dom[name] = newProps[name];
    });
};

export { updateDom };
