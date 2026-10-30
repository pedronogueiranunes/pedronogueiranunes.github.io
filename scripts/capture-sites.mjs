import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const config = JSON.parse(await readFile(new URL('./capture-sites.json', import.meta.url)));
const args = process.argv.slice(2);
const selected = args.filter(a => !a.startsWith('--')); 
const sites = config.sites.filter(s => s.url && (!selected.length || selected.includes(s.id)));
if (!sites.length) throw Error('No configured site matches. Add URLs to scripts/capture-sites.json.');
if (spawnSync('ffmpeg', ['-version']).status !== 0) throw Error('Install FFmpeg first.');
const output = resolve('captures-hq');
await mkdir(output, {recursive:true});
const browser = await chromium.launch({headless:true, ...(process.env.CAPTURE_BROWSER ? {executablePath:process.env.CAPTURE_BROWSER} : {})});
const results=[];
let previous=[];try{previous=JSON.parse(await readFile(resolve(output,'report.json')));}catch{}
const saveReport=()=>writeFile(resolve(output,'report.json'),JSON.stringify([...previous.filter(row=>!results.some(r=>r.id===row.id)),...results],null,2));
function encode(args) { const r=spawnSync('ffmpeg',['-y','-hide_banner','-loglevel','error',...args],{encoding:'utf8'}); if(r.status!==0) throw Error(r.stderr); }
try {
 for (const site of sites) {
  const dir=resolve(output,site.id); await mkdir(dir,{recursive:true});
  let context;
  try {
   if (args.includes('--resume') && !site.retryRequired) {
    try {
     await stat(resolve(dir,'full.mp4'));  await stat(resolve(dir,'preview.mp4'));
     encode(['-ss','0.5','-i',resolve(dir,'preview.mp4'),'-frames:v','1',resolve(dir,'poster.png')]);
     await sharp(resolve(dir,'poster.png')).webp({quality:82}).toFile(resolve(dir,'poster.webp'));
     results.push({id:site.id,url:site.url,status:'captured',reusedVideo:true,previewBytes:(await stat(resolve(dir,'preview.mp4'))).size});
     console.log('Reused video and generated poster:',site.id);
     continue;
    } catch { /* Capture again if existing outputs cannot be reused. */ }
   }
   context=await browser.newContext({viewport:config.viewport,deviceScaleFactor:1,reducedMotion:'no-preference',locale:'en-US',colorScheme:'light'});
   const page=await context.newPage();
   const response = await page.goto(site.url,{waitUntil:'load',timeout:60000});
   if (response && response.status() >= 400) throw Error(`HTTP ${response.status()}: ${site.url}`);
   await page.evaluate(async()=>{
    await Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,15000))]);
    const images=[...document.images].filter(img=>img.getBoundingClientRect().top<innerHeight);
    await Promise.race([Promise.all(images.map(img=>img.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,10000))]);
   });
   await page.waitForTimeout(site.loadWaitMs ?? 3000);
   if(site.dismissSelector) { const button=page.locator(site.dismissSelector).first(); if(await button.isVisible()) await button.click(); }
   const hideSelectors=site.hideSelectors ?? [];
   await page.addStyleTag({content:'*,*::before,*::after { cursor:none !important; }' + (hideSelectors.length ? hideSelectors.join(',')+'{display:none !important;visibility:hidden !important;pointer-events:none !important;}' : '')});
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   const cdp=await context.newCDPSession(page);
   await cdp.send('Page.startScreenRecording',{audio:false,maxWidth:config.viewport.width,maxHeight:config.viewport.height,frameRate:config.captureFps});
   await page.waitForTimeout(config.holdMs);
   const scroll=await page.evaluate(async ({speed,maxSeconds,easing,hideSelectors})=>{
    const began=performance.now();let last=began,y=window.scrollY,overlayVisibleFrames=0;
    const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
    return await new Promise(resolve=>{
     function frame(now){const dt=Math.min(now-last,50);last=now;const max=document.documentElement.scrollHeight-innerHeight;
      let factor=1;
      if(easing){const start=smooth((now-began)/easing.rampMs);const hero=easing.heroSpeedFactor+(1-easing.heroSpeedFactor)*smooth(y/easing.heroDistance);const end=Math.max(.15,smooth((max-y)/easing.endDistance));factor=start*hero*end;}
      if(hideSelectors.some(selector=>[...document.querySelectorAll(selector)].some(el=>{const box=el.getBoundingClientRect();return box.width>0&&box.height>0&&getComputedStyle(el).visibility!=='hidden';})))overlayVisibleFrames++;
      y=Math.min(max,y+speed*factor*dt/1000);window.scrollTo({top:y,behavior:'instant'});
      if(y>=max-1 || now-began>=maxSeconds*1000)resolve({seconds:(now-began)/1000,reachedBottom:y>=max-1 && window.scrollY>=max-2,actualScrollY:window.scrollY,overlayVisibleFrames});else requestAnimationFrame(frame);
     }requestAnimationFrame(frame);
    });
   },{speed:config.scrollPixelsPerSecond,maxSeconds:site.maxSeconds ?? config.maxSeconds,easing:site.scrollEasing,hideSelectors});
   await page.waitForTimeout(config.holdMs);
   const {stream}=await cdp.send('Page.stopScreenRecording');
   const recordingStart=resolve(dir,'master.webm');
   const chunks=[];
   while(true){const chunk=await cdp.send('IO.read',{handle:stream,size:1048576});chunks.push(Buffer.from(chunk.data,chunk.base64Encoded?'base64':'utf8'));if(chunk.eof)break;}
   await writeFile(recordingStart,Buffer.concat(chunks));await cdp.send('IO.close',{handle:stream});
   const segment=scroll.seconds+config.holdMs*2/1000;
   await context.close();context=null;
   if(!scroll.reachedBottom) throw Error('Scroll safety limit reached; master saved, full export rejected. Increase maxSeconds.');
   encode(['-i',recordingStart,'-an','-vf','fps=60','-c:v','libx264','-crf','18','-preset','slow','-pix_fmt','yuv420p','-movflags','+faststart',resolve(dir,'full.mp4')]);
   const duration=Math.min(config.previewSeconds,segment);
   encode(['-i',resolve(dir,'full.mp4'),'-t',String(duration),'-an','-vf','scale=960:600:flags=lanczos,fps=30','-c:v','libx264','-crf','23','-preset','slow','-pix_fmt','yuv420p','-movflags','+faststart',resolve(dir,'preview.mp4')]);
   encode(['-ss','0.5','-i',resolve(dir,'preview.mp4'),'-frames:v','1',resolve(dir,'poster.png')]);
   await sharp(resolve(dir,'poster.png')).webp({quality:82}).toFile(resolve(dir,'poster.webp')); 
   const probe=spawnSync('ffprobe',['-v','error','-show_entries','stream=codec_name,width,height,r_frame_rate,avg_frame_rate:format=duration,size','-of','json',recordingStart],{encoding:'utf8'});
   results.push({id:site.id,url:site.url,status:'captured',scroll,previewSeconds:duration,source:JSON.parse(probe.stdout),fullBytes:(await stat(resolve(dir,'full.mp4'))).size,previewBytes:(await stat(resolve(dir,'preview.mp4'))).size});
   console.log('Captured:',site.id);
  } catch(error){results.push({id:site.id,status:'failed',error:String(error)});console.error(site.id,error.message);}
  finally {if(context)await context.close();await saveReport();}
 }
} finally {await browser.close();}
if(results.some(r=>r.status==='failed')) process.exitCode=1;
