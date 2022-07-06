// 1.0.0
(()=>{"use strict";var e={929:(e,t,n)=>{function o(e){const{h:t,ref:n,reactive:o,Teleport:r,onMounted:s,onBeforeUpdate:a,onBeforeUnmount:i,defineComponent:c}=e;return function(e){const l=e.propNames.attrs,d=e.propNames.events,u=e.propNames.slots,p=new Map;for(let e=0;e<l.length;e++){const t=l[e];p.set(t,t),p.set(t.toLowerCase(),t),p.set(t.replace(/[A-Z]/g,"-$&").toLowerCase(),t)}const m=new Map;for(let e=0;e<d.length;e++){const t=d[e],n=t[0].toUpperCase(),o=t.slice(1);m.set("on"+n+o,t),m.set("on"+n+o.toLowerCase(),t)}const f=new Map;for(let e=0;e<u.length;e++){const t=u[e];f.set(t,t),f.set(t.toLowerCase(),t),f.set(t.replace(/[A-Z]/g,"-$&").toLowerCase(),t)}return c({inheritAttrs:!1,setup(c,l){const d={},u=o([]);function w(){const e={},t={},n={},o=Object.keys(l.attrs);for(let r=0;r<o.length;r++){const s=o[r],a=p.get(s);if(a){e[a]=l.attrs[s];continue}const i=m.get(s);i?t[i]=l.attrs[s]:n[s]=l.attrs[s]}return{attrs:e,events:t,others:n,slots:d}}let h;Object.keys(l.slots).forEach((e=>{const n=f.get(e);if(!n)return;const o=l.slots[e];d[n]=function(e,s){const a=t(r,{to:e},o(s));a.name=n;const i=u.findIndex((e=>e.name===n));-1===i?u.push(a):u[i]=a}}));const v=n();return s((()=>{const t=w();h=new e(v.value,t)})),a((()=>{const e=w();h.changed(e)})),i((()=>{h.disconnected()})),()=>[t(e.tag,{ref:v}),...u]}})}}n.r(t),n.d(t,{default:()=>o})}},t={};function n(o){var r=t[o];if(void 0!==r)return r.exports;var s=t[o]={exports:{}};return e[o](s,s.exports,n),s.exports}n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{n.S={};var e={},t={};n.I=(o,r)=>{r||(r=[]);var s=t[o];if(s||(s=t[o]={}),!(r.indexOf(s)>=0)){if(r.push(s),e[o])return e[o];n.o(n.S,o)||(n.S[o]={}),n.S[o];var a=[];return e[o]=a.length?Promise.all(a).then((()=>e[o]=1)):1}}})(),(()=>{function e(e){return new Promise(((t,n)=>{const o=document.createElement("script");o.async=!0,o.src=e,o.onload=()=>{o.onerror=o.onload=null,t(null)},o.onerror=()=>{o.onerror=o.onload=null,n(new Error(`Failed to load ${e}`))},(document.head||document.getElementsByTagName("head")[0]).appendChild(o)}))}const t=new Promise((e=>{"complete"===document.readyState?e():window.addEventListener("load",(()=>e()))}));function o(e){let t;try{t=new Function("$data",`with ($data) { return (${e}) }`)({})}catch(t){console.error(`${t.message} in expression: ${e}`)}return t}function r(t,r){const s=t.reactive({teleports:[]}),a=t.createApp({data:()=>s,render:()=>s.teleports.map((e=>t.h(t.Teleport,{to:e.target},e.component)))});function i(){const e=document.querySelectorAll("template[hfz]");if(!e.length)return;const n=[];e.forEach((e=>{var o,r,s;const i=c(e);if(i.name)return a.component(i.name,i),void(null===(o=e.parentNode)||void 0===o||o.removeChild(e));let l;if(e.hasAttribute("mount")){if(l=document.querySelector(e.getAttribute("mount")),!l)return}else l=document.createElement("div"),null===(r=e.parentNode)||void 0===r||r.insertBefore(l,e);n.push({target:l,component:t.h(i)}),null===(s=e.parentNode)||void 0===s||s.removeChild(e)})),s.teleports=s.teleports.concat(n)}function c(s){let a={};const i=s.content.querySelector("script");if(i){const e=i.textContent.trim(),t=e.slice(e.indexOf("{"));a=new Function("return "+t)()}s.hasAttribute(":data")&&!a.data&&(a.data=o(s.getAttribute(":data"))),s.hasAttribute(":props")&&!a.props&&(a.props=o(s.getAttribute(":props")));const l={};if(s.getAttributeNames().forEach((o=>{if("import:"!==o.slice(0,7))return;const a=o.split(":"),i=a[1],d=a[2];let u=s.getAttribute(o);var p;"."===u[0]||"/"===u[0]?l[d||i]=(p=u,t.defineAsyncComponent({loader:()=>new Promise(((e,t)=>{var n=new XMLHttpRequest;n.onreadystatechange=function(){if(4==this.readyState){if(200==this.status){const t=this.responseText,n=document.createElement("template");n.innerHTML=t;const o=n.content.querySelector("template");return void e(c(o))}t(new Error("fail to load remote template: "+p))}},n.open("GET",p,!0),n.send()}))})):l[d||i]=function(o,s){return t.defineAsyncComponent({loader(){let a="@hyper.fun/"+o;s&&(a=a+"@"+s);let i=window.$HFC_NPM_CDN_URL;const c=window[`$HFC_CDN_REWRITE_${a}`];return c&&(i=c),e(`${i}/${a}/wfm/entry.js`).then((()=>function(e){const t=window.$HFC_WFM_CONTAINERS[e],o=t.init(n.S.default);return(o&&o.then?o:Promise.resolve()).then((()=>t.get("./hfc"))).then((e=>e()))}("@hyper.fun/"+o))).then((e=>r(e.default,!0))).catch((e=>(console.error(e),console.warn(`[hfz] faild to load component: ${o} ${s} `),t.defineComponent({}))))}})}(i,u)})),a.name=s.getAttribute("name"),a.components=l,a.render=t.compile(s.innerHTML,{runtimeGlobalName:"$HFZ_VUE"}),"function"!=typeof a.data){const e=a.data;a.data=()=>e}return a}a.component("block",{emits:["mounted","unmounted"],setup:(e,{slots:n,emit:o})=>(t.onMounted((()=>o("mounted"))),t.onUnmounted((()=>o("unmounted"))),()=>n.default&&n.default())}),a.mount(document.createElement("template")),i(),window.$HFZ_MOUNT_TEMPLATES=i}window.$HFC_NPM_CDN_URL=window.$HFC_NPM_CDN_URL||"https://npm.hyper.fun/npm",window.$HFC_WFM_CONTAINERS=window.$HFC_WFM_CONTAINERS||{},Promise.all([new Promise((t=>{var n;if(!window.$HFZ_VUE)return"object"==typeof(n=window.Vue)&&"3"===n.version[0]&&n.compile&&n.Teleport?(window.$HFZ_VUE=window.Vue,void t(window.$HFZ_VUE)):void e(window.$HFC_NPM_CDN_URL+"/vue@3.2.37/dist/vue.global.prod.js").then((()=>{window.$HFZ_VUE=window.Vue,t(window.$HFZ_VUE)}));t(window.$HFZ_VUE)})),Promise.resolve().then(n.bind(n,929)),t,function(){const e=n.I("default");return e.then?e:Promise.resolve()}()]).then((([e,t])=>{!function(e,t,o){const r=n.S.default.vue=n.S.default.vue||{},s=r[t];s&&s.loaded||(r[t]={get:()=>Promise.resolve((()=>o)),from:"hfc",eager:!1})}(0,window.$HFZ_VUE.version,window.$HFZ_VUE),r(e,t.default(e))})).catch((e=>{console.warn("[hfz] faild to init"),console.error(e)}))})()})();
