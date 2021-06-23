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
};

const commitRoot = () => {
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
};
const commitWork = (fiber) => {
  if (!fiber) return;
  const parentDom = fiber.parent.dom;
  parentDom.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.subling);
};

const render = (element, container) => {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternative: currentRoot,
  };
  nextUnitOfWork = wipRoot;
};

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
const workLoop = (deadline) => {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() - 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    // finish work , commit dom
    commitRoot();
  }
  requestIdleCallback(workLoop);
};
requestIdleCallback(workLoop);
const performUnitOfWork = (fiber) => {
  // peform work & return next work
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.subling) return nextFiber.subling;
    nextFiber = nextFiber.parent;
  }
};
const reconcileChildren = (fiber, elements) => {
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
