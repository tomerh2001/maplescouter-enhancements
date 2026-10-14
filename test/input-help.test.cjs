const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const src = fs.readFileSync('src/maplescouter-en-fix.user.js','utf8');
const catalog = JSON.parse(fs.readFileSync('data/checkbox-help.json'));
function env() {
  const ctx = vm.createContext({Map,WeakMap,setTimeout,clearTimeout,siteRefs:{},location:{pathname:'/en/input'},pathLocale:()=> 'en'});
  vm.runInContext(src.slice(src.indexOf('  function noteHelpRuntime('),src.indexOf('  function noteExports(')),ctx);
  vm.runInContext(src.slice(src.indexOf('  function cardHelp('),src.indexOf('  var CHECK_HELP_SELECTOR')),ctx);
  vm.runInContext(src.slice(src.indexOf('  var CHECK_HELP_SELECTOR'),src.indexOf('  /* ---------------- 4a. Tooltip keep-alive')),ctx);
  return ctx;
}
const ctx=env();
const info=(extra={})=>({route:'/input',id:'',role:'checkbox',label:'',context:'',image:'',...extra});
const resolve=(extra,list=catalog.rules)=>ctx.resolveCheckboxHelp(info(extra),list);
test('obvious and unknown controls receive no invented explanation',()=>{
  for(const id of ['expand-all','show-chart','new-site-checkbox']) assert.equal(resolve({id}),null);
  for(const label of ['Class','Level','Damage','Boss Damage','Buff Duration','Show all']) assert.equal(resolve({label},catalog.fields),null);
});
test('Wild Hunter explains whose level and both important Legion tiers',()=>{
  const t=resolve({label:'Wild Hunter Legion'},catalog.fields).text;
  assert.match(t,/Legion member's level/); assert.match(t,/Lv\. 200 = 3\.2%/); assert.match(t,/Lv\. 250 = 4%/);
  assert.equal(resolve({label:'Wild Hunter Legion',route:'/result'},catalog.fields),null);
});
test('stat input help distinguishes flat stats from multiplied stats',()=>{
  assert.equal(resolve({label:'Base Value'},catalog.fields),null);
  assert.equal(resolve({label:'% Value Not Applied'},catalog.fields),null);
  assert.match(resolve({label:'Final Attack'},catalog.fields).text,/Artifact's Final Attack Damage %/);
});
test('reused IDs are resolved by route and nearby caption, not document order',()=>{
  assert.equal(resolve({id:'ascentic-pump'}),null);
  assert.match(resolve({route:'/spec-order',id:'ascentic-pump',context:'Next Area'}).text,/cannot enter yet/);
  assert.match(resolve({route:'/spec-order',id:'ascentic-pump',context:'Sacred Power'}).text,/boss damage multiplier/);
  assert.equal(resolve({route:'/result',role:'switch',id:'destiny-checkbox'}),null);
});
test('buff descriptions retain exact bonuses and explicit exclusions',()=>{
  assert.match(resolve({image:'/next/doping_v2/apple.png'}).text,/\+100 ATT\/MATT/);
  assert.match(resolve({image:'/next/doping_v2/shiningblue.png'}).text,/\+20% IED.*Replaces Advanced Weapon Tempering/);
  assert.match(resolve({image:'/next/doping_v2/jangbi.png'}).text,/\+5% Critical Damage/);
  assert.match(resolve({route:'/result',id:'Lv-23-checkbox'}).text,/gain from Lv\. 2 to Lv\. 3/);
});
test('copy is short, has no boilerplate fallback or em dashes',()=>{
  for(const r of [...catalog.rules,...catalog.fields,...catalog.metrics,...catalog.cards].filter(r=>r.text)) {
    assert.ok(r.text.split(/\s+/).length<=25,r.text);
    assert.doesNotMatch(r.text,/—|\byour\b|include.*calculation|this checkbox|toggle this|when enabled/i);
  }
});
test('native runtime discovery requires a complete component family',()=>{
  const c=env();
  // Production is emitted with double-quoted property names.
  const fn=slot=>vm.runInContext('(function(){return {"data-slot":"'+slot+'"}})',c);
  c.noteHelpRuntime({a:fn('tooltip'),b:fn('tooltip-trigger')});assert.equal(c.siteRefs.tooltip,undefined);
  c.noteHelpRuntime({a:fn('tooltip-content')});assert.equal(c.siteRefs.tooltip,undefined);
  const group={a:fn('tooltip'),b:fn('tooltip-trigger'),c:fn('tooltip-content')};
  c.noteHelpRuntime(group);assert.equal(c.siteRefs.tooltip.Content,group.c);
  c.noteHelpRuntime({createRoot(){}});assert.equal(c.siteRefs.createRoot,undefined);
  const react={createElement(){},useState(){}};c.noteHelpRuntime(react);assert.equal(c.siteRefs.react,react);
});
function node(attrs={}) {
  return {attrs:{...attrs},isConnected:true,nodeType:1,textContent:'',children:[],parentElement:null,
    getAttribute(k){return this.attrs[k]??null},setAttribute(k,v){this.attrs[k]=String(v)},hasAttribute(k){return k in this.attrs},removeAttribute(k){delete this.attrs[k]},
    closest(){return null},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},after(el){this.afterNode=el},appendChild(el){this.children.push(el)},remove(){this.isConnected=false},getClientRects(){return [{}]},getBoundingClientRect(){return {x:20,y:30,width:40,height:20,bottom:50,top:30}}};
}
test('field help preserves input values, existing ARIA descriptions and focus order',()=>{
  const c=env(),input=node({'aria-describedby':'site-tip'}),label=node();
  input.value='212';label.textContent='Wild Hunter Legion';label.parentElement=node();label.parentElement.querySelectorAll=()=>[input];
  c.document={querySelector:()=>null,createElement:()=>node(),createElementNS:()=>node(),body:{appendChild(){}}};
  c.data=()=>({checkboxHelp:catalog,i18nPatch:{},dict:{}});
  const rec=c.ensureFieldHelp(label); assert.ok(rec);assert.equal(input.value,'212');assert.equal(rec.anchor,rec.icon);assert.ok(rec.targets.includes(rec.icon));assert.equal(label.afterNode,rec.icon);assert.ok(!label.hasAttribute('tabindex'));
  assert.ok(input.getAttribute('aria-describedby').startsWith('site-tip msfix-check-help-'));
  c.ensureFieldHelp(label);assert.equal(c.checkHelpRecords.size,1);
  c.removeCheckboxHelp(label,rec);assert.equal(input.getAttribute('aria-describedby'),'site-tip');assert.equal(input.value,'212');assert.equal(c.checkHelpRecords.size,0);
});
test('field association does not reach across a multi-input table',()=>{
  const c=env(),label=node(),inputs=[node(),node(),node()];label.textContent='Final Attack';label.parentElement=node();label.parentElement.querySelectorAll=()=>inputs;
  c.document={querySelector:()=>null,createElement:()=>node(),createElementNS:()=>node(),body:{appendChild(){}}};c.data=()=>({checkboxHelp:catalog,i18nPatch:{},dict:{}});
  const rec=c.ensureFieldHelp(label);assert.equal(rec.described[0],label);assert.equal(label.tabIndex,undefined);assert.equal(rec.icon.type,'button');
  inputs.forEach(n=>assert.equal(n.getAttribute('aria-describedby'),null));
});
test('native rendering uses the captured skill component and an inert anchor',()=>{
  const c=env(),renders=[];
  c.siteRefs={react:{createElement:(type,props,...children)=>({type,props,children})},tooltip:{Root:'native-root',Trigger:'native-trigger',Content:'native-content'},createRoot:()=>({render:v=>renders.push(v)})};
  c.document={querySelector:()=>null,createElement:()=>node(),createElementNS:()=>node(),body:{appendChild(){}}};
  const rec={node:{id:'test',textContent:'Specific effect.'}};
  c.renderNativeHelp(rec,{x:2,y:3,width:5,height:6});const tree=renders[0];
  assert.equal(tree.type,'native-root');assert.equal(tree.children[1].type,'native-content');assert.equal(tree.children[1].props.sideOffset,undefined);
  assert.equal(tree.children[0].children[0].props.style.pointerEvents,'none');
  assert.equal(tree.children[0].children[0].props.tabIndex,-1);
  c.renderNativeHelp(rec,{x:2,y:3,width:5,height:6});assert.equal(renders.length,1);
  c.hideCheckboxHelp();assert.equal(renders.at(-1).props.open,false);assert.equal(renders.at(-1).children[1].type,'native-content');
});
test('missing native runtime fails closed instead of replacing controls',()=>{
  const c=env(); assert.doesNotThrow(()=>c.renderNativeHelp({node:{id:'x',textContent:'x'}},{}));assert.equal(c.checkHelpRoot,null);
});
test('pointer focus does not pin help, while keyboard focus remains accessible',()=>{
  const c=env(),events={},control=node(),rec={control};
  control.matches=()=>false;
  c.document={addEventListener:(type,fn)=>{events[type]=fn}};
  c.window={addEventListener(){}};c.setTimeout=()=>0;c.clearTimeout=()=>{};
  const shown=[];c.showCheckboxHelp=r=>shown.push(r);c.hideCheckboxHelp=()=>shown.push('closed');
  c.checkHelpTargets.set(control,rec);c.startCheckboxHelp();
  events.pointerdown({target:control,pointerType:'mouse'});events.focusin({target:control});
  assert.equal(c.checkHelpFocus,null);assert.equal(shown.length,0);
  events.keydown({key:'Tab'});events.focusin({target:control});assert.equal(c.checkHelpFocus,rec);assert.equal(shown.at(-1),rec);
  events.keydown({key:'Escape'});assert.equal(c.checkHelpFocus,null);assert.equal(shown.at(-1),'closed');
});

test('existing symbol tooltip already explains its damage bonus',()=>{
  assert.equal(resolve({image:'/next/images/authentic_symbol.png'}),null);
  assert.match(resolve({image:'/next/doping_v2/hero.png'}).text,/4%/); // Native tooltip only names Echo of Hero.
});

test('controls wrapped in native help are left to the native tooltip',()=>{
  const c=env(),control=node({'aria-describedby':'native-tip'});
  control.closest=selector=>selector.includes('tooltip-trigger')?{}:null;
  assert.equal(c.ensureCheckboxHelp(control),null);
  assert.equal(control.getAttribute('aria-describedby'),'native-tip');assert.equal(c.checkHelpRecords.size,0);
});

test('Destiny label names stage 2 only on its input checkbox, preserving the skill name elsewhere',()=>{
 const c=env();
 vm.runInContext(src.slice(src.indexOf('  function clarifiedControlLabel('),src.indexOf('  function translateTextNode(')),c);
 assert.equal(c.clarifiedControlLabel('First Legacy','destiny2ndSkill','/en/input'),'Destiny 2 Liberated');
 assert.equal(c.clarifiedControlLabel('최초의 유산','destiny2ndSkill','/ko/input'),null);
 assert.equal(c.clarifiedControlLabel('First Legacy','최초의 유산','/en/result'),'Destiny 2 Buff');
 assert.equal(c.clarifiedControlLabel('Ghost Pirate','파이렛플래그','/en/result'),"Pirate's Banner");
 assert.equal(c.clarifiedControlLabel('First Legacy','unrelated','/en/input'),null);
 assert.equal(resolve({id:'artifact_increaseTarget'}),null);
 assert.equal(resolve({id:'destiny2ndSkill'}).text,'First Legacy Buff: +10% ATT/MATT');
});


test('re-entry during native fade-out skips the entrance, but a fresh hover animates',()=>{
  const c=env(),renders=[];let visible=null;
  c.siteRefs={react:{createElement:(type,props,...children)=>({type,props,children})},tooltip:{Root:'root',Trigger:'trigger',Content:'content'},createRoot:()=>({render:v=>renders.push(v)})};
  c.document={querySelector:()=>visible,createElement:()=>node(),createElementNS:()=>node(),body:{appendChild(){}}};c.getComputedStyle=()=>({opacity:'0.6'});
  const rec={node:{id:'test',textContent:'Buff.'}},rect={x:2,y:3,width:5,height:6};
  c.renderNativeHelp(rec,rect);assert.equal(renders.at(-1).children[1].props.style,undefined);
  visible=node();c.renderNativeHelp(null);c.renderNativeHelp(rec,rect);
  assert.equal(renders.at(-1).children[1].props.style.animationName,'none');
  c.renderNativeHelp(null);assert.equal(renders.at(-1).children[1].props.style,undefined);
  visible=null;c.renderNativeHelp(rec,rect);assert.equal(renders.at(-1).children[1].props.style,undefined);
});

test('a tooltip popper containing our help cannot be pinned by the old hover-card layer',()=>{
  const c=env();vm.runInContext(src.slice(src.indexOf('  function canPinFloating('),src.indexOf('  // keep tracked rects')),c);
  const wrapper={closest:()=>null,querySelector:s=>s==='[data-msfix-input-help]'?{}:null};
  assert.equal(c.canPinFloating(wrapper),false);
});


test('help is placed outside the whole field, not over its label or input',()=>{
  const c=env(),control=node(),anchor=node();const bounds={x:10,y:50,width:280,height:44,top:50,bottom:94};
  anchor.getBoundingClientRect=()=>bounds;c.window={innerHeight:800};
  c.checkHelpActive={control,anchor};let used;c.renderNativeHelp=(_rec,r)=>{used=r};c.placeCheckboxHelp();assert.equal(used,bounds);
});


test('checkbox, label and padding share one block target without duplicate bindings',()=>{
  const c=env(),control=node(),label=node(),block=node();control.id='destiny2ndSkill';label.textContent='Destiny 2 Liberated';
  block.querySelectorAll=()=>[control];control.parentElement=label.parentElement=block;
  c.document={querySelector:()=>null,createElement:()=>node(),createElementNS:()=>node(),body:{appendChild(){}}};
  c.checkboxInfo=()=>({scope:block,labelNode:label,label:label.textContent});c.checkHelpDescription=()=>({text:'Buff.'});
  const rec=c.ensureCheckboxHelp(control);assert.equal(rec.anchor,block);assert.equal(rec.targets.length,1);assert.equal(rec.targets[0],block);
  c.ensureCheckboxHelp(control);assert.equal(c.checkHelpRecords.size,1);assert.equal(c.checkHelpTargets.get(block),rec);
});

test('native skill icon inside a helped block keeps its own tooltip only',()=>{
  const c=env(),icon=node(),block=node();icon.parentElement=block;icon.closest=()=>({});c.checkHelpTargets.set(block,{control:block});
  assert.equal(c.checkboxHelpTarget(icon),null);
});

test('refresh does not turn array indexes into help for every label',()=>{
  const c=env(), labels=['Level','Class','Wild Hunter Legion','Final Attack','Base Value','% Value Not Applied'].map(text=>Object.assign(node(),{textContent:text}));
  c.document={querySelector:()=>null,querySelectorAll:s=>s==='span, label'?labels:[],createElement:()=>node(),createElementNS:()=>node(),body:{appendChild(){}}};
  c.data=()=>({checkboxHelp:catalog,i18nPatch:{},dict:{}});
  c.refreshCheckboxHelp();assert.equal(c.checkHelpRecords.size,2);
  c.refreshCheckboxHelp();assert.equal(c.checkHelpRecords.size,2);
  assert.equal(c.ensureFieldHelp(labels[0],42),null);
  const icons=labels.filter(l=>l.afterNode).map(l=>l.afterNode);
  assert.equal(icons.length,2); icons.forEach(icon=>{
    assert.equal(icon.children[0].attrs.stroke,'var(--text-gray-disabled)');
    assert.equal(icon.children[0].attrs.class,'lucide lucide-circle-help size-4');
  });
});

test('guild and Champion bonuses follow the entered level, including zero and disabled buffs',()=>{
  const c=env();c.data=()=>({checkboxHelp:catalog});c.translateString=s=>s;
  const guild=n=>c.cardHelp({imageUrl:'/doping_v2/noblessboss.png',tooltip:'Boss Slayers',active:true,inputProps:{value:String(n)}});
  assert.equal(guild(15).detail,'Lv. 15: +30% Boss Damage.');assert.equal(guild(4).detail,'Lv. 4: +8% Boss Damage.');assert.equal(guild(0).detail,'Lv. 0: +0% Boss Damage.');
  const champ=(key,n)=>c.cardHelp({imageUrl:'/doping_v2/champion.png',tooltip:'Level',inputProps:{value:String(n),onChange:Function('return "'+key+'"')}});
  assert.equal(champ('championAtk',4).detail,'Lv. 4: +20 ATT/MATT.');
  assert.equal(champ('championCriDmg',3).detail,'Lv. 3: +1.5% Critical Damage.');
  assert.equal(champ('championIgnore',5).detail,'Lv. 5: +10% IED.');
  assert.equal(champ('championAll',4).detail,'Lv. 4: +40 All Stats, +2,000 Max HP/MP.');
  assert.equal(champ('championBoss',0).detail,'Lv. 0: +0% Boss Damage.');
  assert.equal(champ('futureUnknown',4).detail,''); // Same icon never implies the wrong stat.
  assert.match(guild('').detail,/Range/);assert.match(guild(16).detail,/Range/);
  assert.equal(c.cardHelp({imageUrl:'/doping_v2/noblesscridam.png',tooltip:'Hard Hitter',active:false,inputProps:{value:'15'}}).detail,'Inactive. Lv. 15: +30% Critical Damage.');
});

test('Link card uses class as title and the actual GMS skill name as subtext',()=>{
  const c=env();c.data=()=>({checkboxHelp:catalog});c.translateString=s=>s;
  assert.deepEqual(JSON.parse(JSON.stringify(c.cardHelp({imageUrl:'/linkskill/kadena.png',tooltip:'Cadena'}))),{title:'Cadena',detail:'Unfair Advantage'});
  assert.equal(c.cardHelp({imageUrl:'/linkskill/kain.png',tooltip:'Kain'}).detail,'Time to Prepare');
  assert.equal(c.cardHelp({imageUrl:'/linkskill/mukhyun.png',tooltip:'Mo Xuan'}).detail,'Qi Cultivation');
});

test('combining a card keeps its image, inputs and click handlers unchanged',()=>{
  const c=env();c.data=()=>({checkboxHelp:catalog});c.translateString=s=>s;
  c.siteRefs={react:{cloneElement:(tree,props,children)=>({...tree,props:{...tree.props,...props,children}})},tooltip:{},createRoot(){}};
  const props={imageUrl:'/linkskill/ark.png',tooltip:'Ark',inputProps:{value:'2'}},image={type:'image'},input={type:'input',props:props.inputProps},onClick=()=>{};
  const tree={type:'div',props:{onClick,children:[{props:{children:[{props:{children:image}},{props:{children:'Ark'}}]}},input]}};
  const result=c.combinedBuffTree(tree,props);
  assert.equal(result.props.children[0],image);assert.equal(result.props.children[1],input);assert.equal(result.props.onClick,onClick);
  assert.equal(result.props['data-msfix-buff-title'],'Ark');assert.equal(result.props['data-msfix-buff-detail'],'Solus');
  c.pathLocale=()=> 'ko';assert.equal(c.combinedBuffTree(tree,props),tree);
  c.pathLocale=()=> 'en';assert.equal(c.combinedBuffTree(tree,{...props,tooltip:{complex:true}}),tree);
  assert.equal(c.combinedBuffTree({type:'div',props:{children:[]}},props).props.children.length,0);
});

test('one description per card updates in place without touching input values',()=>{
  const c=env(),card=node({'data-msfix-buff-title':'Legion Champion','data-msfix-buff-detail':'Lv. 4: +20 ATT/MATT.'}),input=node({'aria-describedby':'native-description'});input.value='4';
  card.querySelectorAll=()=>[input];c.document={createElement:()=>node(),body:{appendChild(){}}};
  const rec=c.ensureCardHelp(card);assert.equal(rec.targets[0],card);
  card.setAttribute('data-msfix-buff-detail','Lv. 3: +15 ATT/MATT.');c.ensureCardHelp(card);
  assert.equal(c.checkHelpRecords.size,1);assert.equal(rec.detail,'Lv. 3: +15 ATT/MATT.');assert.equal(input.value,'4');
  assert.equal(input.getAttribute('aria-describedby'),'native-description '+rec.node.id);
  c.removeCheckboxHelp(card,rec);assert.equal(input.getAttribute('aria-describedby'),'native-description');
});


test('metric help uses the full native row without icons or layout changes',()=>{
  const c=env(), row=node({'aria-describedby':'site-help'}), label=node(), value=node();
  label.textContent='Normal';value.textContent='1,849,195,171';row.children=[label,value];
  row.style={display:'flex'};
  c.document={createElement:()=>node(),body:{appendChild(){}}};
  const children=row.children,style=row.style;
  const rec=c.ensureMetricRowHelp(row,'Power from stats and equipment.');
  assert.equal(rec.anchor,row);assert.equal(c.checkHelpTargets.get(row),rec);
  assert.equal(rec.icon,undefined);assert.equal(row.children,children);assert.equal(row.style,style);
  assert.equal(row.getAttribute('tabindex'),'0');assert.equal(value.textContent,'1,849,195,171');
  assert.equal(c.ensureMetricRowHelp(row,'Updated insight.'),rec);assert.equal(c.checkHelpRecords.size,1);
  assert.equal(rec.node.textContent,'Updated insight.');
  c.removeCheckboxHelp(row,rec);
  assert.equal(row.getAttribute('tabindex'),null);assert.equal(row.getAttribute('aria-describedby'),'site-help');
});
test('metric cleanup preserves pre-existing keyboard access',()=>{
  const c=env(),row=node({tabindex:'-1'});c.document={createElement:()=>node(),body:{appendChild(){}}};
  const rec=c.ensureMetricRowHelp(row,'Insight.');c.removeCheckboxHelp(row,rec);
  assert.equal(row.getAttribute('tabindex'),'-1');
});
test('Mu Gong explains its GMS attack bonus and duration, not how to click',()=>{
  const help=resolve({id:'mugongSoul'}), text=help.title+' '+help.detail;
  assert.match(text,/\+25% ATT\/MATT/);assert.match(text,/Lv\. 1: 10s; Lv\. 2: 20s/);
  assert.doesNotMatch(text,/click|cycle|toggle|cooldown/i);
  assert.doesNotMatch(JSON.stringify(catalog),/Lower upgrades lower|Uncheck to keep|not a predicted floor/);
  for(const id of ['hyper','union','link','buff']) assert.equal(resolve({route:'/optimizer',id}),null);
});

test('unreleased mastery placeholders do not impersonate a released skill',()=>{
  const c=env();c.data=()=>({checkboxHelp:catalog});c.translateString=s=>s;
  assert.equal(c.cardHelp({tooltip:'XXX',imageUrl:'/icon/icon_guide.png'}).title,'Unreleased Mastery Skill');
  assert.equal(c.cardHelp({tooltip:'SHINE Tree of Stars',imageUrl:'/hexaskill/Sia_11.png'}).title,'SHINE Tree of Stars');
  assert.equal(c.cardHelp({tooltip:'XXX',imageUrl:'/unrelated.png'}).title,'XXX');
});
