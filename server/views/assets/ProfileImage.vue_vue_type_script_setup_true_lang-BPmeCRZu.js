import{importShared as r,__tla as L}from"./__federation_fn_import-ofDdBDNE.js";let V,j,d,P=Promise.all([(()=>{try{return L}catch{}})()]).then(async()=>{let p,c,m,g,f,v,w,x,D,y,k,_,h,b,S,B,E,C,l,T,R,q,z,i,N;({defineComponent:p}=await r("vue")),{toDisplayString:c,openBlock:m,createElementBlock:g,createCommentVNode:f}=await r("vue"),v={key:0,class:"absolute top-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded mt-1 whitespace-nowrap z-10 dark:bg-gray-500"},{ref:w,onMounted:x,onUnmounted:D}=await r("vue"),d=p({__name:"Tooltip",props:{content:{type:String,required:!0},targetRef:{type:Object,required:!1}},setup(e){const n=e,t=w(!1),s=()=>{t.value=!0},u=()=>{t.value=!1};return x(()=>{var a,o;(a=n.targetRef)==null||a.addEventListener("mouseover",s),(o=n.targetRef)==null||o.addEventListener("mouseout",u)}),(a,o)=>t.value?(m(),g("div",v,c(e.content),1)):f("",!0)}}),{defineComponent:y}=await r("vue"),{toDisplayString:k,createElementVNode:_,openBlock:h,createElementBlock:b}=await r("vue"),S={class:"inline-flex items-center gap-x-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset bg-red-50 text-red-900 ring-red-500/30 cursor-pointer dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/30"},V=y({__name:"StatusBadge",props:{title:{type:String,required:!0}},setup(e){return(n,t)=>(h(),b("span",S,[_("span",null,k(e.title),1)]))}}),{defineComponent:B}=await r("vue"),{normalizeClass:E,createElementVNode:C,openBlock:l,createBlock:T,createCommentVNode:R,createElementBlock:q}=await r("vue"),z=["src","alt"],{ref:i,computed:N}=await r("vue"),j=B({__name:"ProfileImage",props:{src:{type:String,required:!0},size:{type:String,default:"medium"},tooltipText:{type:String,required:!1}},setup(e){const n=e,t=i(null),s=a=>({large:"w-30 h-30",medium:"w-20 h-20",small:"w-10 h-10"})[a];i(!1);const u=N(()=>s(n.size));return(a,o)=>(l(),q("div",{class:"relative",ref_key:"tooltipTarget",ref:t},[C("img",{src:e.src,alt:e.tooltipText,width:"50",height:"50",class:E([u.value,"rounded-full object-cover border-2"])},null,10,z),t.value&&e.tooltipText?(l(),T(d,{key:0,targetRef:t.value,content:e.tooltipText},null,8,["targetRef","content"])):R("",!0)],512))}})});export{V as _,P as __tla,j as a,d as b};
