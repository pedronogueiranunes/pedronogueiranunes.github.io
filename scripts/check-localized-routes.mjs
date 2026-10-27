import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { parse } from 'parse5';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const paths=[];
function scan(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){if(['pt-br','es','fr','_astro','assets'].includes(item.name))continue;const file=path.join(dir,item.name);if(item.isDirectory())scan(file);else if(item.name==='index.html')paths.push(path.relative(root,file));}}
scan(root);
let count=0;
for(const locale of ['pt-br','es','fr'])for(const route of paths){
 const file=path.join(root,locale,route);assert.ok(fs.existsSync(file),`Missing localized route: ${file}`);
 const html=fs.readFileSync(file,'utf8');const tree=parse(html);let canonical=false,alternates=0;
 function walk(node){const attrs=Object.fromEntries((node.attrs||[]).map(a=>[a.name,a.value]));
  if(node.tagName==='html')assert.equal(attrs.lang,locale);
  if(node.tagName==='a'&&attrs.href?.startsWith('/')&&!attrs.href.startsWith('//')&&!attrs.href.startsWith('/assets/'))assert.ok(attrs.href.startsWith(`/${locale}/`)||attrs.href===`/${locale}`,`Unlocalized link in ${file}: ${attrs.href}`);
  if(node.tagName==='link'&&attrs.rel==='canonical'){canonical=true;assert.ok(new URL(attrs.href).pathname.startsWith(`/${locale}/`));}
  if(node.tagName==='link'&&attrs.rel==='alternate'&&attrs.hreflang)alternates++;
  for(const child of node.childNodes||[])walk(child);
 }
 walk(tree);assert.ok(canonical);assert.equal(alternates,5);count++;
}
console.log(`Validated ${count} translated routes: HTML language, internal links, canonical URLs and language alternates.`);
