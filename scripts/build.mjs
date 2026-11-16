import fs from 'node:fs';
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
let worker=fs.readFileSync('worker/index.js','utf8');
worker=fs.readFileSync('worker/research-engine.js','utf8')+'\n'+worker.replace("import {researchReadiness,researchApi} from './research-engine.js';",'');
// ASCII transport preserves every Unicode character across Windows shells and APIs.
const literal=value=>JSON.stringify(value).replace(/[^\x00-\x7f]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));
for(const [key,path] of [['ROSTER','data/roster.json'],['SEED','data/seed.json']])worker=worker.replace('/*'+key+'*/null',()=>literal(JSON.parse(fs.readFileSync(path,'utf8'))));
const page=fs.readFileSync('web/index.html','utf8').replace('<!--INNER_CIRCLE_BRAND-->',()=>'<style id="inner-circle-brand">'+fs.readFileSync('web/brand.css','utf8')+'\n'+fs.readFileSync('web/research.css','utf8')+'</style>').replace('</body>',()=>'<script>'+fs.readFileSync('web/research.js','utf8')+'</script></body>');
worker=worker.replace('/*PAGE*/null',()=>literal(page));
fs.writeFileSync('dist/server/index.js',worker);fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
const wrapper=fs.readFileSync('worker/cloudflare-wrapper.js','utf8');
fs.writeFileSync('dist/server/cloudflare.js',worker.replace('export default {async fetch(req,env)', 'const app={async fetch(req,env)')+'\n'+wrapper);
console.log('Built Gravity Research Room');
