import './index.css'
import { createApp } from 'vue'
import * as React from 'react'
import * as ReactDom from 'react-dom'
import logo from './jser-logo.png'
// import add from './add'
// import svg from './heart.svg'

console.log(createApp)
console.log(React)
console.log(ReactDom)

const HFC = function (initProps) {
  console.log(initProps)

  return {
    connected(container) {
      const div = document.createElement('div')
      div.innerHTML = 'awa-btn'
      div.classList.add('name')
      container.appendChild(div)
      const btn = document.createElement('button')
      btn.classList.add('btn', 'text-2xl')
      btn.innerText = 'AWA BTN!'
      btn.onclick = function () {
        console.log('dispatching click')
        setTimeout(() => {
          initProps.events.click()
        }, 50)
      }

      const img = document.createElement('img')
      img.src = logo
      container.appendChild(btn)
      container.appendChild(img)

      if (initProps.slots.default) {
        const div = document.createElement('div')
        container.appendChild(div)
        initProps.slots.default(div)
      }
    },
    changed(props) {
      console.log(props)
    },
    disconnected() {},
  }
}

HFC.tag = 'div'
HFC.hfc = process.env.HFC_NAME
HFC.ver = process.env.HFC_VERSION
HFC.names = process.env.HFC_PROP_NAMES

export default HFC
