const createElement = (type, props, ...children) => {
  return Object.assign({
    type,
    props: {
      ...props,
      children:children.map(child=>
        child instanceof Object?child:createTextNode(child)
      )
    }
  },null)
}
const createTextNode = (text)=>{
  return {
    type:"TEXT_ELEMENT",
    props:{
      nodeValue:text,
      children:[]
    }
  }
}
const Titeact = {
  createElement
}

/** @jsx Titeact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)

console.log(element);