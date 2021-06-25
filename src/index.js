import { createElement, createDom } from "./createElement";
import {updateDom} from './updateDom'

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;
const commitRoot = () => {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
};
const commitDeletion = (fiber,parentDom)=>{
  if(fiber.dom){
    parentDom.removeChild(fiber.dom)
  }else {
    commitDeletion(fiber.child,parentDom)
  }
}
const commitWork = (fiber) => {
  if (!fiber) return;
  let parentDomFiber = fiber.parent
  while (!parentDomFiber.dom){
    parentDomFiber = parentDomFiber.parent
  }
  const parentDom = parentDomFiber.dom
  if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
    parentDom.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber,parentDom)
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
};

const render = (element, container) => {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
};

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
  // perform work & return next work
  const isFucComponent = fiber.type instanceof Function
  if(isFucComponent){
    updateFucComponent(fiber)
  }else {
    updateHostComponent(fiber)
  }
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
};
const updateFucComponent = (fiber) =>{
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

const updateHostComponent = (fiber) =>{
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber,fiber.props.children)
}

const reconcileChildren = (wipFiber, elements) => {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;
  while (index < elements.length) {
    const element = elements[index];
    let newFiber = null;
    const SameType = element && oldFiber && element.type === oldFiber.type;
    if (SameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }
    if (element && !SameType) {
      // add new
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }
    if (oldFiber && !SameType) {
      // delete node
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }
    if(oldFiber){
      oldFiber = oldFiber.sibling
    }
    if (index === 0) {
      wipFiber.child = newFiber;
    } else if(element){
       prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
};
const Titeact = {
  createElement,
  render,
};

// /** @jsx Titeact.createElement */
// const container = document.getElementById("root");
//
// const updateValue = (e) => {
//   rerender(e.target.value);
// };
// const rerender = (value) => {
//   const element = (
//     <div id="foo">
//       <h1>bar</h1>
//       <h2>foo</h2>
//       <input type="text" onInput={updateValue} value={value} />
//       {value}
//     </div>
//   );
//   Titeact.render(element, container);
// };
// rerender("hello");


/** @jsx Titeact.createElement */
function App(props) {
  return <h1>Hi {props.name}</h1>
}
const element = <App name="foo" />
const container = document.getElementById("root");
Titeact.render(element, container)