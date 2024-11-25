import{importShared as t,__tla as O}from"./__federation_fn_import-ofDdBDNE.js";import{a as L,_ as Z,b as Q,__tla as W}from"./Card.vue_vue_type_script_setup_true_lang-C6_uo5E3.js";import{_ as X,__tla as Y}from"./LocationBadge.vue_vue_type_script_setup_true_lang-BqAJP18j.js";import{_ as ee,__tla as te}from"./Main.vue_vue_type_script_setup_true_lang-CyFdDOl7.js";let E,ae=Promise.all([(()=>{try{return O}catch{}})(),(()=>{try{return W}catch{}})(),(()=>{try{return Y}catch{}})(),(()=>{try{return te}catch{}})()]).then(async()=>{await t("vue"),await t("vue"),await t("vue");const{defineComponent:I}=await t("vue"),{toDisplayString:P,openBlock:U,createElementBlock:$}=await t("vue"),j={class:"flex items-center p-2 w-full border-t border-gray-100 dark:border-gray-700 hover:bg-blue-50 text-blue-500 dark:hover:bg-gray-800 transition duration-150 ease-in-out cursor-pointer"};await t("vue");const q=I({__name:"ChatListItem",props:{title:{type:String,required:!0}},setup(u){return(m,o)=>(U(),$("span",j,P(u.title),1))}}),{defineComponent:A}=await t("vue"),{createTextVNode:w,withCtx:y,createVNode:b,renderList:D,Fragment:F,openBlock:p,createElementBlock:g,createBlock:M,resolveComponent:T}=await t("vue"),z={className:"ml-4 min-w-[150px]"};await t("vue");let k,C,x,c,_,G,B,h,v,R,f,i,S,N;k=A({__name:"SideBar",props:{chatRooms:{type:Array,default:[]},href:{type:String,default:""}},emits:["selectChatRoom"],setup(u,{emit:m}){const o=m,s=d=>{o("selectChatRoom",d)};return(d,l)=>{const n=T("router-link");return p(),g("div",z,[b(X,null,{default:y(()=>l[0]||(l[0]=[w("Chat rooms:")])),_:1}),(p(!0),g(F,null,D(u.chatRooms,a=>(p(),M(q,{key:a.id,title:a.title,onClick:()=>s(a.id)},null,8,["title","onClick"]))),128)),b(n,{to:u.href,class:"flex items-center p-2 w-full border-t border-gray-100 dark:border-gray-700 hover:bg-blue-50 text-blue-500 dark:hover:bg-gray-800 transition duration-150 ease-in-out cursor-pointer"},{default:y(()=>l[1]||(l[1]=[w(" New chat room ")])),_:1},8,["to"])])}}}),{defineComponent:C}=await t("vue"),{unref:x,openBlock:c,createBlock:_,createCommentVNode:G,createElementBlock:B,withCtx:h,createVNode:v}=await t("vue"),R={key:1},{ref:f,inject:i,computed:S,onMounted:N}=await t("vue"),E=C({__name:"ChatView",setup(u){const m="//localhost:3001",o=i("interest"),s=i("location"),d=i("profile"),l=i("tab"),n=f(""),a=f([]),H=S(()=>{var r,V;const e=new URLSearchParams;return o.value&&e.append("interest",(r=o.value)==null?void 0:r.id),s.value&&e.append("location",(V=s.value)==null?void 0:V.id),`/chat/create${e.toString()?"?"+e.toString():""}`}),J=async e=>{try{return(await L.get(`/api/chat/rooms/${e}`)).data}catch(r){console.error(r)}},K=e=>{n.value=e};return N(async()=>{var e,r;a.value=await J(((e=o.value)==null?void 0:e.id)||((r=s.value)==null?void 0:r.id)),a.value.length&&(n.value=a.value[0].id),l.value="Chat"}),L.defaults.baseURL=m,(e,r)=>(c(),_(Z,null,{default:h(()=>[v(Q,null,{default:h(()=>[n.value?(c(),_(ee,{key:0,user:x(d),roomId:n.value},null,8,["user","roomId"])):(c(),B("span",R," No chat rooms available "))]),_:1}),v(k,{chatRooms:a.value,href:H.value,onSelectChatRoom:K},null,8,["chatRooms","href"])]),_:1}))}})});export{E as _,ae as __tla};
