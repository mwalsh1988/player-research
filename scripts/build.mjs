import fs from 'node:fs';
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
let worker=fs.readFileSync('worker/index.js','utf8');
for(const [key,path] of [['ROSTER','data/roster.json'],['SEED','data/seed.json']])worker=worker.replace('/*'+key+'*/null',fs.readFileSync(path,'utf8'));
worker=worker.replace('/*PAGE*/null',JSON.stringify(fs.readFileSync('web/index.html','utf8')));
fs.writeFileSync('dist/server/index.js',worker);fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Built Gravity Research Room');
