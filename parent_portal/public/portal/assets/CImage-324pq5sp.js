import{r as t,_ as q,q as ne,R as i,t as P,v as D,P as n}from"./index-DHC1J-Z3.js";var te=function(e){var u=e.getBoundingClientRect();return Math.floor(u.top)>=0&&Math.floor(u.left)>=0&&Math.floor(u.bottom)<=(window.innerHeight||document.documentElement.clientHeight)&&Math.floor(u.right)<=(window.innerWidth||document.documentElement.clientWidth)},re=t.createContext({}),ae=t.forwardRef(function(e,u){var s=e.children,c=e.activeIndex,a=c===void 0?0:c,C=e.className,N=e.controls,E=e.dark,S=e.indicators,w=e.interval,b=w===void 0?5e3:w,_=e.onSlid,f=e.onSlide,L=e.pause,I=L===void 0?"hover":L,k=e.touch,V=k===void 0?!0:k,y=e.transition,R=e.wrap,H=R===void 0?!0:R,T=q(e,["children","activeIndex","className","controls","dark","indicators","interval","onSlid","onSlide","pause","touch","transition","wrap"]),h=t.useRef(null),W=ne(u,h),v=t.useRef({}).current,x=t.useState(a),o=x[0],p=x[1],d=t.useState(!1),l=d[0],A=d[1],g=t.useState(),B=g[0],se=g[1],z=t.useState("next"),F=z[0],X=z[1],G=t.useState(0),O=G[0],ce=G[1],J=t.useState(null),le=J[0],K=J[1],Q=t.useState(),U=Q[0],Y=Q[1];t.useEffect(function(){ce(t.Children.toArray(s).length)}),t.useEffect(function(){U&&j()},[U]),t.useEffect(function(){!l&&j(),!l&&_&&_(o,F),l&&f&&f(o,F)},[l]),t.useEffect(function(){return window.addEventListener("scroll",$),function(){window.removeEventListener("scroll",$)}});var j=function(){Z(),!(!H&&o===O-1)&&typeof b=="number"&&(v.timeout=setTimeout(function(){return ue()},typeof B=="number"?B:b))},Z=function(){return I&&v.timeout&&clearTimeout(v.timeout)},ue=function(){if(!document.hidden&&h.current&&te(h.current)){if(l)return;M("next")}},M=function(r){l||(X(r),r==="next"?o===O-1?p(0):p(o+1):p(o===0?O-1:o-1))},de=function(r){if(o!==r){if(o<r){X("next"),p(r);return}o>r&&(X("prev"),p(r))}},$=function(){!document.hidden&&h.current&&te(h.current)?Y(!0):Y(!1)},fe=function(r){var m=le;if(m!==null){var me=r.touches[0].clientX,ee=m-me;ee>5&&M("next"),ee<-5&&M("prev"),K(null)}},ve=function(r){var m=r.touches[0].clientX;K(m)};return i.createElement("div",P({className:D("carousel slide",{"carousel-fade":y==="crossfade"},C)},E&&{"data-coreui-theme":"dark"},{onMouseEnter:Z,onMouseLeave:j},V&&{onTouchStart:ve,onTouchMove:fe},T,{ref:W}),i.createElement(re.Provider,{value:{setAnimating:A,setCustomInterval:se}},S&&i.createElement("div",{className:"carousel-indicators"},Array.from({length:O},function(r,m){return m}).map(function(r){return i.createElement("button",P({key:"indicator".concat(r),onClick:function(){!l&&de(r)},className:D({active:o===r}),"data-coreui-target":""},o===r&&{"aria-current":!0},{"aria-label":"Slide ".concat(r+1)}))})),i.createElement("div",{className:"carousel-inner"},t.Children.map(s,function(r,m){if(i.isValidElement(r))return i.cloneElement(r,{active:o===m,direction:F,key:m})})),N&&i.createElement(i.Fragment,null,i.createElement("button",{className:"carousel-control-prev",onClick:function(){return M("prev")}},i.createElement("span",{className:"carousel-control-prev-icon","aria-label":"prev"})),i.createElement("button",{className:"carousel-control-next",onClick:function(){return M("next")}},i.createElement("span",{className:"carousel-control-next-icon","aria-label":"next"})))))});ae.propTypes={activeIndex:n.number,children:n.node,className:n.string,controls:n.bool,dark:n.bool,indicators:n.bool,interval:n.oneOfType([n.bool,n.number]),onSlid:n.func,onSlide:n.func,pause:n.oneOf([!1,"hover"]),touch:n.bool,transition:n.oneOf(["slide","crossfade"]),wrap:n.bool};ae.displayName="CCarousel";var oe=t.forwardRef(function(e,u){var s=e.children,c=e.className,a=e.active,C=e.direction,N=e.interval,E=N===void 0?!1:N,S=q(e,["children","className","active","direction","interval"]),w=t.useContext(re),b=w.setAnimating,_=w.setCustomInterval,f=t.useRef(null),L=ne(u,f),I=t.useRef(),k=t.useState(),V=k[0],y=k[1],R=t.useState(),H=R[0],T=R[1],h=t.useState(a&&"active"),W=h[0],v=h[1],x=t.useState(0),o=x[0],p=x[1];return t.useEffect(function(){a&&(_(E),o!==0&&T("carousel-item-".concat(C))),I.current&&!a&&v("active"),(a||I.current)&&setTimeout(function(){var d;o!==0&&((d=f.current)===null||d===void 0||d.offsetHeight,y("carousel-item-".concat(C==="next"?"start":"end")))},0),I.current=a,o===0&&p(o+1)},[a]),t.useEffect(function(){var d,l;return(d=f.current)===null||d===void 0||d.addEventListener("transitionstart",function(){a&&b(!0)}),(l=f.current)===null||l===void 0||l.addEventListener("transitionend",function(){a&&b(!1),y(""),T(""),a&&v("active"),a||v("")}),function(){var A,g;(A=f.current)===null||A===void 0||A.removeEventListener("transitionstart",function(){a&&b(!0)}),(g=f.current)===null||g===void 0||g.removeEventListener("transitionend",function(){a&&b(!1),y(""),T(""),a&&v("active"),a||v("")})}}),i.createElement("div",P({className:D("carousel-item",W,V,H,c),ref:L},S),s)});oe.propTypes={active:n.bool,children:n.node,className:n.string,direction:n.string,interval:n.oneOfType([n.bool,n.number])};oe.displayName="CCarouselItem";var ie=t.forwardRef(function(e,u){var s,c=e.align,a=e.className,C=e.fluid,N=e.rounded,E=e.thumbnail,S=q(e,["align","className","fluid","rounded","thumbnail"]);return i.createElement("img",P({className:D((s={},s["float-".concat(c)]=c&&(c==="start"||c==="end"),s["d-block mx-auto"]=c&&c==="center",s["img-fluid"]=C,s.rounded=N,s["img-thumbnail"]=E,s),a)||void 0},S,{ref:u}))});ie.propTypes={align:n.oneOf(["start","center","end"]),className:n.string,fluid:n.bool,rounded:n.bool,thumbnail:n.bool};ie.displayName="CImage";export{ae as C,oe as a,ie as b};
