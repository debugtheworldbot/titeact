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
  const isProperty = (key) => key !== "children";
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((k) => (dom[k] = fiber.props[k]));
  return dom;
  // for (const child of fiber.props.children) {
  //   render(child, dom);
  // }
  // container.appendChild(dom);
};

const render = (element, container) => {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
};

let nextUnitOfWork = null;
const workLoop = (deadline) => {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() - 1;
  }
  requestIdleCallback(workLoop);
};
requestIdleCallback(workLoop);
const performUnitOfWork = (fiber) => {
  // peform work & return next work
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }
  const elements = fiber.props.children;
  let index = 0;
  let prevSubling = null;
  while (index < elements.length) {
    const element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSubling.subling = newFiber;
    }
    prevSubling = newFiber;
    index++;
  }
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.subling) return nextFiber.subling;
    nextFiber = nextFiber.parent;;
  }
};
const Titeact = {
  createElement,
  render,
};

/** @jsx Titeact.createElement */
const element = (
  <div id="foo">
    <h1>bar</h1>
    <h2>foo</h2>
  </div>
);
const container = document.getElementById("root");
Titeact.render(element, container);
