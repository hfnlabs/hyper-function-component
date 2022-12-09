"use strict";function Yr(l,d){function r(){this.constructor=l}r.prototype=d.prototype,l.prototype=new r}function _(l,d,r,x){var A=Error.call(this,l);return Object.setPrototypeOf&&Object.setPrototypeOf(A,_.prototype),A.expected=d,A.found=r,A.location=x,A.name="SyntaxError",A}Yr(_,Error);function ne(l,d,r){return r=r||" ",l.length>d?l:(d-=l.length,r+=r.repeat(d),l+r.slice(0,d))}_.prototype.format=function(l){var d="Error: "+this.message;if(this.location){var r=null,x;for(x=0;x<l.length;x++)if(l[x].source===this.location.source){r=l[x].text.split(/\r\n|\n|\r/g);break}var A=this.location.start,w=this.location.source+":"+A.line+":"+A.column;if(r){var F=this.location.end,j=ne("",A.line.toString().length," "),R=r[A.line-1],h=A.line===F.line?F.column:R.length+1,g=h-A.column||1;d+=`
 --> `+w+`
`+j+` |
`+A.line+" | "+R+`
`+j+" | "+ne("",A.column-1," ")+ne("",g,"^")}else d+=`
 at `+w}return d},_.buildMessage=function(l,d){var r={literal:function(h){return'"'+A(h.text)+'"'},class:function(h){var g=h.parts.map(function(C){return Array.isArray(C)?w(C[0])+"-"+w(C[1]):w(C)});return"["+(h.inverted?"^":"")+g.join("")+"]"},any:function(){return"any character"},end:function(){return"end of input"},other:function(h){return h.description}};function x(h){return h.charCodeAt(0).toString(16).toUpperCase()}function A(h){return h.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\0/g,"\\0").replace(/\t/g,"\\t").replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/[\x00-\x0F]/g,function(g){return"\\x0"+x(g)}).replace(/[\x10-\x1F\x7F-\x9F]/g,function(g){return"\\x"+x(g)})}function w(h){return h.replace(/\\/g,"\\\\").replace(/\]/g,"\\]").replace(/\^/g,"\\^").replace(/-/g,"\\-").replace(/\0/g,"\\0").replace(/\t/g,"\\t").replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/[\x00-\x0F]/g,function(g){return"\\x0"+x(g)}).replace(/[\x10-\x1F\x7F-\x9F]/g,function(g){return"\\x"+x(g)})}function F(h){return r[h.type](h)}function j(h){var g=h.map(F),C,S;if(g.sort(),g.length>0){for(C=1,S=1;C<g.length;C++)g[C-1]!==g[C]&&(g[S]=g[C],S++);g.length=S}switch(g.length){case 1:return g[0];case 2:return g[0]+" or "+g[1];default:return g.slice(0,-1).join(", ")+", or "+g[g.length-1]}}function R(h){return h?'"'+A(h)+'"':"end of input"}return"Expected "+j(l)+" but "+R(d)+" found."};function es(l,d){d=d!==void 0?d:{};var r={},x=d.grammarSource,A={schema:be},w=be,F="model",j="{",R="}",h=":",g="[]",C=`
`,S="@",je="(",O=",",Re=")",fe="//",K=".",Se="[",De="]",ie="false",le="true",Oe="-",ce='"',oe="\\",ze=/^[A-Z]/,N=/^[0-9a-z]/i,Ie=/^[a-z]/i,T=/^[0-9]/,ue=/^[^\0-\x1F"]/,ge=/^[ \t]/,pe=/^[ \t\n\r]/,Be=/^[\n\r]/,Le=m("model",!1),Me=m("{",!1),Ne=m("}",!1),ve=m(":",!1),Te=m("[]",!1),Ze=m(`
`,!1),Ue=m("@",!1),We=m("(",!1),z=m(",",!1),Xe=m(")",!1),qe=m("//",!1),Z=jr(),Ge=E([["A","Z"]],!1,!1),U=E([["0","9"],["a","z"]],!1,!0),Q=m(".",!1),He=E([["a","z"]],!1,!0),Je=m("[",!1),Ke=m("]",!1),Qe=m("false",!1),Ve=m("true",!1),Ye=m("-",!1),W=E([["0","9"]],!1,!1),$e=m('"',!1),he=m("\\",!1),de=E([["\0",""],'"'],!0,!1),er=H("horizontal whitespace"),Ae=E([" ","	"],!1,!1),rr=H("any whitespace"),me=E([" ","	",`
`,"\r"],!1,!1),sr=H("end of line"),tr=E([`
`,"\r"],!1,!1),ar=function(e){return{kind:"schema",declarations:D(e)}},nr=function(e,t){return P(e,t,1)},fr=function(e,t,f){return{kind:e,name:t,members:f.members,location:k()}},ir=function(e){return{kind:"modelBlock",members:D(e)}},lr=function(e,t){return P(e,t,1)},cr=function(e,t,f,a,n){return{kind:"field",name:t,type:f,attributes:D(n),list:!!a,comment:e,location:k()}},or=function(e){return{kind:"typeId",name:e}},ur=function(e,t){return{kind:"fieldAttribute",name:e,args:D(t),location:k()}},gr=function(e,t){return P(e,t,1)},pr=function(e){return D(e)},vr=function(e,t){return P(e,t,2)},$r=function(e,t){return{kind:"namedArgument",name:e,expression:t}},hr=function(e,t){return{kind:"commentBlock",comments:P(e,t,1)}},dr=function(e){return{kind:"comment",text:e,location:k()}},Ar=function(){return G()},mr=function(e){return{kind:"name",value:e,location:k()}},xr=function(e,t){return{kind:"name",value:e+t.join(""),location:k()}},Cr=function(e,t){return{kind:"path",value:P(e,t,2),location:k()}},br=function(e,t){return e+t.join("")},yr=function(e,t){return{kind:"functionCall",path:e,args:t}},wr=function(e){return{kind:"array",items:D(e)}},Er=function(e,t){return P(e,t,2)},_r=function(){return{kind:"literal",value:G()==="true"}},Fr=function(){return{kind:"literal",value:parseInt(G())}},kr=function(e){return{kind:"literal",value:e}},Pr=function(){return G()},s=0,u=0,X=[{line:1,column:1}],y=0,V=[],c=0,q;if("startRule"in d){if(!(d.startRule in A))throw new Error(`Can't start parsing from rule "`+d.startRule+'".');w=A[d.startRule]}function G(){return l.substring(u,s)}function rs(){return u}function ss(){return{source:x,start:u,end:s}}function k(){return I(u,s)}function ts(e,t){throw t=t!==void 0?t:I(u,s),Ce([H(e)],l.substring(u,s),t)}function as(e,t){throw t=t!==void 0?t:I(u,s),Sr(e,t)}function m(e,t){return{type:"literal",text:e,ignoreCase:t}}function E(e,t,f){return{type:"class",parts:e,inverted:t,ignoreCase:f}}function jr(){return{type:"any"}}function Rr(){return{type:"end"}}function H(e){return{type:"other",description:e}}function xe(e){var t=X[e],f;if(t)return t;for(f=e-1;!X[f];)f--;for(t=X[f],t={line:t.line,column:t.column};f<e;)l.charCodeAt(f)===10?(t.line++,t.column=1):t.column++,f++;return X[e]=t,t}function I(e,t){var f=xe(e),a=xe(t);return{source:x,start:{offset:e,line:f.line,column:f.column},end:{offset:t,line:a.line,column:a.column}}}function o(e){s<y||(s>y&&(y=s,V=[]),V.push(e))}function Sr(e,t){return new _(e,null,null,t)}function Ce(e,t,f){return new _(_.buildMessage(e,t),e,t,f)}function be(){var e,t,f,a;return e=s,t=b(),f=Dr(),f===r&&(f=null),a=b(),u=e,e=ar(f),e}function Dr(){var e,t,f,a,n,i;if(e=s,t=Y(),t!==r){for(f=[],a=s,n=b(),i=Y(),i!==r?(n=[n,i],a=n):(s=a,a=r);a!==r;)f.push(a),a=s,n=b(),i=Y(),i!==r?(n=[n,i],a=n):(s=a,a=r);u=e,e=nr(t,f)}else s=e,e=r;return e}function Y(){var e;return e=Or(),e===r&&(e=Ee()),e}function Or(){var e,t,f,a,n,i;return e=s,l.substr(s,5)===F?(t=F,s+=5):(t=r,c===0&&o(Le)),t!==r?(f=p(),a=Fe(),a!==r?(n=p(),i=ye(),i!==r?(u=e,e=fr(t,a,i)):(s=e,e=r)):(s=e,e=r)):(s=e,e=r),e}function ye(){var e,t,f,a,n,i;return e=s,l.charCodeAt(s)===123?(t=j,s++):(t=r,c===0&&o(Me)),t!==r?(f=b(),a=zr(),a===r&&(a=null),n=b(),l.charCodeAt(s)===125?(i=R,s++):(i=r,c===0&&o(Ne)),i!==r?(u=e,e=ir(a)):(s=e,e=r)):(s=e,e=r),e}function zr(){var e,t,f,a,n,i;if(e=s,t=ee(),t!==r){for(f=[],a=s,n=b(),i=ee(),i!==r?(n=[n,i],a=n):(s=a,a=r);a!==r;)f.push(a),a=s,n=b(),i=ee(),i!==r?(n=[n,i],a=n):(s=a,a=r);u=e,e=lr(t,f)}else s=e,e=r;return e}function ee(){var e,t,f,a,n,i,$,v,Kr,M,Qr,J,Vr,ae;return e=s,t=Ee(),t===r&&(t=null),f=b(),a=_e(),a!==r?(n=p(),l.charCodeAt(s)===58?(i=h,s++):(i=r,c===0&&o(ve)),i!==r?($=p(),v=Ir(),v!==r?(Kr=p(),l.substr(s,2)===g?(M=g,s+=2):(M=r,c===0&&o(Te)),M===r&&(M=null),Qr=p(),J=Lr(),J===r&&(J=null),Vr=p(),l.charCodeAt(s)===10?(ae=C,s++):(ae=r,c===0&&o(Ze)),ae!==r?(u=e,e=cr(t,a,v,M,J)):(s=e,e=r)):(s=e,e=r)):(s=e,e=r)):(s=e,e=r),e}function Ir(){var e;return e=Br(),e===r&&(e=ye()),e}function Br(){var e,t;return e=s,t=Fe(),t!==r&&(u=e,t=or(t)),e=t,e}function re(){var e,t,f,a,n,i;return e=s,l.charCodeAt(s)===64?(t=S,s++):(t=r,c===0&&o(Ue)),t!==r?(f=p(),a=B(),a!==r?(n=p(),i=we(),i===r&&(i=null),u=e,e=ur(a,i)):(s=e,e=r)):(s=e,e=r),e}function Lr(){var e,t,f,a,n,i;if(e=s,t=re(),t!==r){for(f=[],a=s,n=p(),i=re(),i!==r?(n=[n,i],a=n):(s=a,a=r);a!==r;)f.push(a),a=s,n=p(),i=re(),i!==r?(n=[n,i],a=n):(s=a,a=r);u=e,e=gr(t,f)}else s=e,e=r;return e}function we(){var e,t,f,a,n,i,$,v;return e=s,l.charCodeAt(s)===40?(t=je,s++):(t=r,c===0&&o(We)),t!==r?(f=p(),a=Mr(),a===r&&(a=null),n=p(),l.charCodeAt(s)===44?(i=O,s++):(i=r,c===0&&o(z)),i===r&&(i=null),$=p(),l.charCodeAt(s)===41?(v=Re,s++):(v=r,c===0&&o(Xe)),v!==r?(u=e,e=pr(a)):(s=e,e=r)):(s=e,e=r),e}function Mr(){var e,t,f,a,n,i,$,v;if(e=s,t=se(),t!==r){for(f=p(),a=[],n=s,l.charCodeAt(s)===44?(i=O,s++):(i=r,c===0&&o(z)),i!==r?($=p(),v=se(),v!==r?(i=[i,$,v],n=i):(s=n,n=r)):(s=n,n=r);n!==r;)a.push(n),n=s,l.charCodeAt(s)===44?(i=O,s++):(i=r,c===0&&o(z)),i!==r?($=p(),v=se(),v!==r?(i=[i,$,v],n=i):(s=n,n=r)):(s=n,n=r);u=e,e=vr(t,a)}else s=e,e=r;return e}function se(){var e;return e=Nr(),e===r&&(e=L()),e}function Nr(){var e,t,f,a,n,i;return e=s,t=_e(),t!==r?(f=p(),l.charCodeAt(s)===58?(a=h,s++):(a=r,c===0&&o(ve)),a!==r?(n=p(),i=L(),i!==r?(u=e,e=$r(t,i)):(s=e,e=r)):(s=e,e=r)):(s=e,e=r),e}function Ee(){var e,t,f,a,n,i;if(e=s,t=te(),t!==r){for(f=[],a=s,n=b(),i=te(),i!==r?(n=[n,i],a=n):(s=a,a=r);a!==r;)f.push(a),a=s,n=b(),i=te(),i!==r?(n=[n,i],a=n):(s=a,a=r);u=e,e=hr(t,f)}else s=e,e=r;return e}function te(){var e,t,f,a;return e=s,l.substr(s,2)===fe?(t=fe,s+=2):(t=r,c===0&&o(qe)),t!==r?(f=p(),a=Tr(),u=e,e=dr(a)):(s=e,e=r),e}function Tr(){var e,t,f,a,n;for(e=s,t=[],f=s,a=s,c++,n=Pe(),c--,n===r?a=void 0:(s=a,a=r),a!==r?(l.length>s?(n=l.charAt(s),s++):(n=r,c===0&&o(Z)),n!==r?(a=[a,n],f=a):(s=f,f=r)):(s=f,f=r);f!==r;)t.push(f),f=s,a=s,c++,n=Pe(),c--,n===r?a=void 0:(s=a,a=r),a!==r?(l.length>s?(n=l.charAt(s),s++):(n=r,c===0&&o(Z)),n!==r?(a=[a,n],f=a):(s=f,f=r)):(s=f,f=r);return u=e,t=Ar(),e=t,e}function _e(){var e,t;return e=s,t=B(),t!==r&&(u=e,t=mr(t)),e=t,e}function Fe(){var e,t,f,a;if(e=s,ze.test(l.charAt(s))?(t=l.charAt(s),s++):(t=r,c===0&&o(Ge)),t!==r){for(f=[],N.test(l.charAt(s))?(a=l.charAt(s),s++):(a=r,c===0&&o(U));a!==r;)f.push(a),N.test(l.charAt(s))?(a=l.charAt(s),s++):(a=r,c===0&&o(U));u=e,e=xr(t,f)}else s=e,e=r;return e}function ke(){var e,t,f,a,n,i,$,v;if(e=s,t=B(),t!==r){for(f=p(),a=[],n=s,l.charCodeAt(s)===46?(i=K,s++):(i=r,c===0&&o(Q)),i!==r?($=p(),v=B(),v!==r?(i=[i,$,v],n=i):(s=n,n=r)):(s=n,n=r);n!==r;)a.push(n),n=s,l.charCodeAt(s)===46?(i=K,s++):(i=r,c===0&&o(Q)),i!==r?($=p(),v=B(),v!==r?(i=[i,$,v],n=i):(s=n,n=r)):(s=n,n=r);u=e,e=Cr(t,a)}else s=e,e=r;return e}function B(){var e,t,f,a;if(e=s,Ie.test(l.charAt(s))?(t=l.charAt(s),s++):(t=r,c===0&&o(He)),t!==r){for(f=[],N.test(l.charAt(s))?(a=l.charAt(s),s++):(a=r,c===0&&o(U));a!==r;)f.push(a),N.test(l.charAt(s))?(a=l.charAt(s),s++):(a=r,c===0&&o(U));u=e,e=br(t,f)}else s=e,e=r;return e}function Zr(){var e,t,f,a;return e=s,t=ke(),t!==r?(f=p(),a=we(),a!==r?(u=e,e=yr(t,a)):(s=e,e=r)):(s=e,e=r),e}function Ur(){var e,t,f,a,n,i;return e=s,l.charCodeAt(s)===91?(t=Se,s++):(t=r,c===0&&o(Je)),t!==r?(f=p(),a=Wr(),a===r&&(a=null),n=p(),l.charCodeAt(s)===93?(i=De,s++):(i=r,c===0&&o(Ke)),i!==r?(u=e,e=wr(a)):(s=e,e=r)):(s=e,e=r),e}function Wr(){var e,t,f,a,n,i,$,v;if(e=s,t=L(),t!==r){for(f=p(),a=[],n=s,l.charCodeAt(s)===44?(i=O,s++):(i=r,c===0&&o(z)),i!==r?($=p(),v=L(),v!==r?(i=[i,$,v],n=i):(s=n,n=r)):(s=n,n=r);n!==r;)a.push(n),n=s,l.charCodeAt(s)===44?(i=O,s++):(i=r,c===0&&o(z)),i!==r?($=p(),v=L(),v!==r?(i=[i,$,v],n=i):(s=n,n=r)):(s=n,n=r);u=e,e=Er(t,a)}else s=e,e=r;return e}function L(){var e;return e=Zr(),e===r&&(e=Ur(),e===r&&(e=Xr(),e===r&&(e=qr(),e===r&&(e=Gr(),e===r&&(e=ke()))))),e}function Xr(){var e,t;return e=s,l.substr(s,5)===ie?(t=ie,s+=5):(t=r,c===0&&o(Qe)),t===r&&(l.substr(s,4)===le?(t=le,s+=4):(t=r,c===0&&o(Ve))),t!==r&&(u=e,t=_r()),e=t,e}function qr(){var e,t,f,a,n,i,$;if(e=s,l.charCodeAt(s)===45?(t=Oe,s++):(t=r,c===0&&o(Ye)),t===r&&(t=null),f=[],T.test(l.charAt(s))?(a=l.charAt(s),s++):(a=r,c===0&&o(W)),a!==r)for(;a!==r;)f.push(a),T.test(l.charAt(s))?(a=l.charAt(s),s++):(a=r,c===0&&o(W));else f=r;if(f!==r){if(a=s,l.charCodeAt(s)===46?(n=K,s++):(n=r,c===0&&o(Q)),n!==r){if(i=[],T.test(l.charAt(s))?($=l.charAt(s),s++):($=r,c===0&&o(W)),$!==r)for(;$!==r;)i.push($),T.test(l.charAt(s))?($=l.charAt(s),s++):($=r,c===0&&o(W));else i=r;i!==r?(n=[n,i],a=n):(s=a,a=r)}else s=a,a=r;a===r&&(a=null),u=e,e=Fr()}else s=e,e=r;return e}function Gr(){var e,t,f,a;return e=s,l.charCodeAt(s)===34?(t=ce,s++):(t=r,c===0&&o($e)),t!==r?(f=Hr(),l.charCodeAt(s)===34?(a=ce,s++):(a=r,c===0&&o($e)),a!==r?(u=e,e=kr(f)):(s=e,e=r)):(s=e,e=r),e}function Hr(){var e,t,f,a,n;for(e=s,t=[],f=s,l.charCodeAt(s)===92?(a=oe,s++):(a=r,c===0&&o(he)),a!==r?(l.length>s?(n=l.charAt(s),s++):(n=r,c===0&&o(Z)),n!==r?(a=[a,n],f=a):(s=f,f=r)):(s=f,f=r),f===r&&(ue.test(l.charAt(s))?(f=l.charAt(s),s++):(f=r,c===0&&o(de)));f!==r;)t.push(f),f=s,l.charCodeAt(s)===92?(a=oe,s++):(a=r,c===0&&o(he)),a!==r?(l.length>s?(n=l.charAt(s),s++):(n=r,c===0&&o(Z)),n!==r?(a=[a,n],f=a):(s=f,f=r)):(s=f,f=r),f===r&&(ue.test(l.charAt(s))?(f=l.charAt(s),s++):(f=r,c===0&&o(de)));return u=e,t=Pr(),e=t,e}function p(){var e,t;for(c++,e=[],ge.test(l.charAt(s))?(t=l.charAt(s),s++):(t=r,c===0&&o(Ae));t!==r;)e.push(t),ge.test(l.charAt(s))?(t=l.charAt(s),s++):(t=r,c===0&&o(Ae));return c--,t=r,c===0&&o(er),e}function b(){var e,t;for(c++,e=[],pe.test(l.charAt(s))?(t=l.charAt(s),s++):(t=r,c===0&&o(me));t!==r;)e.push(t),pe.test(l.charAt(s))?(t=l.charAt(s),s++):(t=r,c===0&&o(me));return c--,t=r,c===0&&o(rr),e}function Pe(){var e,t;return c++,Be.test(l.charAt(s))?(e=l.charAt(s),s++):(e=r,c===0&&o(tr)),c--,e===r&&(t=r,c===0&&o(sr)),e}function P(e,t,f){return[e].concat(Jr(t,f))}function Jr(e,t){return e.map(function(f){return f[t]})}function D(e){return e!==null?e:[]}if(q=w(),q!==r&&s===l.length)return q;throw q!==r&&s<l.length&&o(Rr()),Ce(V,y<l.length?l.charAt(y):null,y<l.length?I(y,y+1):I(y,y))}export{_ as SyntaxError,es as parse};
