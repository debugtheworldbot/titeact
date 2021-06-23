import { isEvent, isGone, isNew, isProperty } from "./utils";
import { createElement, createDom } from "./createElement";

const updateDom = (dom, prevProps, newProps) => {
  // remove events
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in newProps) || isNew(prevProps, newProps)(key))
    .forEach((key) => {
      const event = key.toLowerCase.substring(2);
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
    .filter(isNew(prevProps,newProps))
    .forEach((key) => {
      const event = key.toLowerCase.substring(2);
      dom.addEventListener(event, newProps[key]);
    });
  // add | set new props
  Object.key(newProps)
    .filter(isProperty)
    .filter(isNew(prevProps, newProps))
    .forEach((name) => {
      dom[name] = newProps[name];
    });
};
const commitRoot = () => {
  deletions.forEach((d) => commitWork(d));
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
};
const commitWork = (fiber) => {
  if (!fiber) return;
  const parentDom = fiber.parent.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
    parentDom.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternative.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    parentDom.removeChild(fiber.dom);
  }
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
  deletions = [];
  nextUnitOfWork = wipRoot;
};

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;
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
  const oldFiber = fiber.alternative  && fiber.alternative.child;
  let index = 0;
  let prevSubling = null;
  while (index < elements.length || oldFiber !== null) {
    const element = elements[index];
    let newFiber = null;
    const isSameType = element && oldFiber && element.type === oldFiber.type;
    if (isSameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: fiber,
        alternative: oldFiber,
        effectTag: "UPDATE",
      };
    }
    if (element && !isSameType) {
      // add new
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: fiber,
        alternative: null,
        effectTag: "PLACEMENT",
      };
    }
    if (oldFiber && !isSameType) {
      // delete node
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }
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
const container = document.getElementById("root");

let inputValue = '222'
const updateValue = e=>{
  inputValue = e.target.value
}
const element = (
  <div id="foo">
    <h1>bar</h1>
    <h2 c='22'>foo</h2>
    <input type="text" a='22' onInput={updateValue} value={inputValue}/>
    {inputValue}
  </div>
);
Titeact.render(element, container);
