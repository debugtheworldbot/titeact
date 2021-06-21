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
const render = (element, container) => {
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode(element.props.nodeValue)
      : document.createElement(element.type);
  const isProperty = (key) => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((k) => (dom[k] = element.props[k]));
  for (const child of element.props.children) {
    render(child, dom);
  }
  container.appendChild(dom);
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