const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync('src/maplescouter-en-fix.user.js','utf8');
const ctx=vm.createContext({WeakMap,encodeURIComponent});
vm.runInContext(src.slice(src.indexOf('  var UNRELEASED_ICON'),src.indexOf('  function translateAttrs')),ctx);
function image(src,alt,title){return {tagName:'IMG',attrs:{src,alt},title,
 getAttribute(k){return this.attrs[k]??null;},setAttribute(k,v){this.attrs[k]=v;},
 closest(){return this.title==null?null:{getAttribute:()=>this.title};}};}
test('empty input slots and independent result paths use an explicit unreleased placeholder',()=>{
 for(const img of [image('', 'doping','Unreleased'),image('/icon/icon_guide.png','doping','Unreleased Mastery Skill'),image('/hexaskill/Sia_12.png','HEXA: Unreleased'),image('/hexaskill/Erel_8.png','hexa-XXX')]){
  ctx.repairUnreleasedImage(img);assert.equal(img.attrs.src,ctx.UNRELEASED_ICON);assert.match(img.attrs.alt,/Unreleased.*Skill/);
  const before=JSON.stringify(img.attrs);ctx.repairUnreleasedImage(img);assert.equal(JSON.stringify(img.attrs),before);
 }
});
test('released skills and unrelated broken images are never replaced',()=>{
 for(const img of [image('/hexaskill/Sia_11.png','SHINE Tree of Stars'),image('/hexaskill/Eunwol_11.png',"Freud's Wisdom VI"),image('/not-found.png','Item'),image('','doping','Onyx Apple')]){
  const before=JSON.stringify(img.attrs);ctx.repairUnreleasedImage(img);assert.equal(JSON.stringify(img.attrs),before);
 }
});
test('changing class restores the original image label without touching controls or values',()=>{
 const img=image('/icon/icon_guide.png','doping','Unreleased Mastery Skill');ctx.repairUnreleasedImage(img);
 img.attrs.src='/hexaskill/Hero_8.png';img.title='Raging Blow VI';ctx.repairUnreleasedImage(img);
 assert.equal(img.attrs.src,'/hexaskill/Hero_8.png');assert.equal(img.attrs.alt,'doping');
});
