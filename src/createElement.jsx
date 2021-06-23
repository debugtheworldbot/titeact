import {updateDom} from "./updateDom";

const createElement = (type, props, ...children) => {
  return Object.assign(
    {
      type,
      props: {
        ...props,
        children: children.map((child) =>
          child instanceof Object ? child : createTextNode(child)
        ),
      },
    },
    null
  );
};
const createTextNode = (text) => {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
};
const createDom = (fiber) => {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode(fiber.props.nodeValue)
      : document.createElement(fiber.type);
  updateDom(dom,{},fiber.props)
  return dom;
};

export { createDom, createElement, createTextNode };
