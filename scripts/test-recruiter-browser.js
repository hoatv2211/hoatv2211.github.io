/* Real Chrome verification; serves the repository without adding dependencies. */
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');
const root = path.resolve(__dirname, '..');
const activeProjects=JSON.parse(fs.readFileSync(path.join(root,'portfolio.json'))).projects.filter(p=>p.status==='active');
const activeKeys=activeProjects.map(p=>p.detailKey);
const out = process.env.RECRUITER_SHOTS || '/Users/mad/.hermes/cache/scratch/recruiter-review';
const mime = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.pdf':'application/pdf','.svg':'image/svg+xml'};
const server = http.createServer((req,res)=>{
  let file = path.join(root, decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if (!file.startsWith(root+path.sep)) {res.writeHead(403).end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory()) file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  fs.mkdirSync(out,{recursive:true});
  const page=await browser.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))errors.push(`${r.status()} ${r.url()}`);});
  for(const width of [320,390,768,1024,1440]){
   await page.setViewportSize({width,height:900});await page.goto(base+'/recruiter/');
   await page.evaluate(()=>{for(const i of document.images)i.loading='eager';});await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0),{timeout:15000});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`overflow at ${width}`);
   const rendered=await page.locator('.project').evaluateAll(cards=>cards.map(c=>c.dataset.project));
   assert.deepEqual([...rendered].sort(),[...activeKeys].sort(),'exact active catalog, once each');
   for(const project of activeProjects){
    const card=page.locator(`.project[data-project="${project.detailKey}"]`);
    await card.locator(`.project-links a[href="/?project=${project.detailKey}"]`).waitFor({state:'attached'});
    assert.equal(await card.getByRole('heading',{name:project.title,exact:true}).count(),1);
    for(const url of Object.values(project.links||{}).filter(Boolean)){
     if(/github|website|appStore|googlePlay/.test(Object.keys(project.links).find(k=>project.links[k]===url)||''))
      assert.equal(await card.locator('a').evaluateAll((as,url)=>as.some(a=>a.getAttribute('href')===url),url),true,url);
    }
   }
   assert.equal(await page.evaluate(()=>[...document.images].every(i=>i.naturalWidth>0)),true);
   assert.equal(await page.locator('.project-cover').count(),activeKeys.length);
   const heroMedia=await page.locator('.hero-work').boundingBox();
   assert.ok(heroMedia.width>250&&heroMedia.height>200,'hero has substantial real media');
   await page.screenshot({path:path.join(out,`recruiter-hero-${width}.png`)});
   await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`recruiter-${width}.png`),fullPage:true});
   if(width===390){
    for(const selector of ['#group-1','#group-2','#group-3','#experience']){
     await page.locator(selector).evaluate(e=>e.scrollIntoView({behavior:'instant',block:'start'}));
     await page.screenshot({path:path.join(out,`recruiter-mobile-${selector.slice(1)}.png`)});
    }
   }
   console.log(`PASS ${width}px: no overflow, exact ${activeKeys.length} active projects, all images loaded`);
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base+'/recruiter/');
  assert.equal(await page.locator('.intro').evaluate(e=>getComputedStyle(e).animationName),'none');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement.className),'skip');
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>location.hash),'#main');
  console.log('PASS keyboard skip link and reduced motion');
  const noJS=await browser.newContext({javaScriptEnabled:false});
  const staticPage=await noJS.newPage();await staticPage.goto(base+'/recruiter/');
  assert.equal(await staticPage.locator('.project').count(),activeKeys.length);await noJS.close();
  console.log('PASS complete static catalog without JavaScript');
  const hrefs=await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
  for(const href of new Set(hrefs)){
   if(href.startsWith('#'))assert.equal(await page.locator(href).count(),1,href);
   else if(href.startsWith('/'))assert.equal((await page.request.get(base+href)).status(),200,href);
  }
  assert.deepEqual(errors,[]);console.log('PASS local links, assets, console and page errors');
  for(const key of activeKeys){
   await page.goto(base+'/?project='+key);await page.waitForTimeout(1000);
   await page.locator(`[data-render="portfolio-details"] [project-detail][data-detail-category="${key}"]`).waitFor({state:'visible',timeout:15000});
   // Assert the actual loaded and visible project root, not a catalog title.
   assert.equal(new URL(page.url()).searchParams.get('project'),key);
   const canonical=JSON.parse(fs.readFileSync(path.join(root,'portfolio.json'))).projects.find(p=>p.detailKey===key);
   assert.equal(await page.getByText(canonical.title,{exact:false}).count()>0,true,`detail title ${key}`);
   console.log(`PASS case study fresh load ${key}`);
  }
  for(const theme of ['game-studio','dev-console']){
   await page.goto(base+`/themes/${theme}/`);await page.waitForURL(`**/backup/${theme}/`);console.log(`PASS theme alias ${theme}`);
  }
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
