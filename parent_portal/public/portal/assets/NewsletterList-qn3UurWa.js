import{u as o,$ as m,r as l,j as e}from"./index-DHC1J-Z3.js";import{X as c}from"./index.es-D46ozxa6.js";const p=()=>{const a=o(),{data:s,error:r,isValidating:n,mutate:u}=m("Newsletter",{fields:["name","subject","message"],filters:{for_parent:1}}),i=l.useMemo(()=>[{name:"ID",selector:t=>e.jsx("div",{onClick:()=>{a(`/newsletter/${t.name}`)},children:t.name})},{name:"Subject",selector:t=>t.subject}],[s]);return n?e.jsx(e.Fragment,{children:"Loading"}):r?e.jsx(e.Fragment,{children:JSON.stringify(r)}):e.jsx("div",{className:"body m-4 mt-0 p-2 bg-white pt-0 rounded",children:e.jsx(c,{title:"Assignments",columns:i,data:s.length>0?s:[],progressPending:n,pagination:!0,highlightOnHover:!0,pointerOnHover:!0})})};export{p as default};
