const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const root = __dirname;
const dist = path.join(root, 'dist');
const failures = [];
const warnings = [];
const notes = [];
const checks = [];

function ok(name, detail='') { checks.push({name, detail}); }
function fail(name, detail='') { failures.push({name, detail}); }
function warn(name, detail='') { warnings.push({name, detail}); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function hashFile(abs) { return crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex'); }
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out=[];
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    const abs=path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs));
    else if (entry.isFile()) out.push(abs);
  }
  return out;
}
function relFrom(base, abs){ return path.relative(base, abs).split(path.sep).join('/'); }
function formatBytes(n){
  if(n<1024) return `${n} B`;
  if(n<1024*1024) return `${(n/1024).toFixed(1)} KB`;
  return `${(n/1024/1024).toFixed(2)} MB`;
}

// 1) Build + generated bundle validity.
try {
  execFileSync(process.execPath, [path.join(root, 'build.js')], {cwd:root, stdio:'pipe'});
  ok('Production build', 'npm build equivalent completed successfully');
} catch (err) {
  fail('Production build', String(err.stderr || err.message));
}
try {
  execFileSync(process.execPath, ['--check', path.join(root,'src','main.js')], {cwd:root, stdio:'pipe'});
  ok('Generated JavaScript syntax', 'src/main.js parses successfully in Node');
} catch (err) {
  fail('Generated JavaScript syntax', String(err.stderr || err.message));
}

// 2) Confirm dist carries only generated runtime, not dev source modules.
const distFiles = walk(dist);
const distRel = distFiles.map(f=>relFrom(dist,f));
const distBytes = distFiles.reduce((n,f)=>n+fs.statSync(f).size,0);
if (distRel.some(r=>r.startsWith('src/modules/'))) fail('Production source hygiene','Development modules found in dist');
else ok('Production source hygiene','No development modules are deployed');

const forbiddenExt = new Set(['.png','.jpg','.jpeg','.wav','.ttf','.otf']);
const forbiddenFiles = distRel.filter(r=>forbiddenExt.has(path.extname(r).toLowerCase()) || /(^|\/)(?:_?test|temp)[^/]*\./i.test(r));
if (forbiddenFiles.length) fail('Production file types', forbiddenFiles.join(', '));
else ok('Production file types','No PNG/JPEG/WAV/TTF/OTF or test/temp files in dist');

if (distBytes <= 7*1024*1024) ok('Deployment footprint', `${formatBytes(distBytes)} across ${distFiles.length} files`);
else warn('Deployment footprint', `${formatBytes(distBytes)} exceeds the 7 MB audit target`);

// 3) Generated payload must match canonical source files exactly.
for (const rel of ['src/main.js','src/styles.css']) {
  const a=path.join(root,rel), b=path.join(dist,rel);
  if (!fs.existsSync(b)) fail('Generated payload', `${rel} missing from dist`);
  else if (hashFile(a)!==hashFile(b)) fail('Generated payload', `${rel} differs between source and dist`);
  else ok(`Generated payload: ${rel}`,'Source and dist are byte-identical');
}

// 4) Static reference scan.
const runtimeTextFiles = ['index.html','admin/index.html','src/main.js','src/styles.css','manifest.webmanifest'];
const sourceText = Object.fromEntries(runtimeTextFiles.map(rel=>[rel,read(rel)]));
const refs = new Set();
for (const [rel, text] of Object.entries(sourceText)) {
  for (const m of text.matchAll(/(?:src|href)=["']([^"'#]+)["']/gi)) refs.add(m[1]);
  for (const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) refs.add(m[1]);
  for (const m of text.matchAll(/["'`]((?:\.\/)?(?:assets|fonts|src)\/[A-Za-z0-9._\-/${}]+)["'`]/g)) refs.add(m[1]);
}
// Expand the single intentional dynamic asset family.
for (const key of ['inner','middle','outer']) refs.add(`./assets/aurora-ring-${key}.webp`);

function normaliseRuntimeRef(ref) {
  if (!ref || /^(?:https?:|data:|#|mailto:|tel:)/i.test(ref)) return null;
  if (ref.includes('${')) return null;
  ref = ref.split('?')[0].split('#')[0];
  ref = ref.replace(/^(?:\.\.\/)+/,'').replace(/^\.\//,'').replace(/^\//,'');
  if (!ref || ref==='admin') return null;
  return ref;
}
const missingRefs=[];
for (const ref of refs) {
  const n=normaliseRuntimeRef(ref);
  if (!n || n==='worker.scriptURL') continue;
  if (!fs.existsSync(path.join(dist,n))) missingRefs.push(ref);
}
if (missingRefs.length) fail('Runtime references', `Missing: ${[...new Set(missingRefs)].join(', ')}`);
else ok('Runtime references','All static runtime asset/font/script/style references resolve');

// Every shipped asset/font should be used.
const referencedNormalised = new Set([...refs].map(normaliseRuntimeRef).filter(Boolean));
const shippedAssetFont = distRel.filter(r=>r.startsWith('assets/')||r.startsWith('fonts/'));
const unused = shippedAssetFont.filter(r=>!referencedNormalised.has(r));
if (unused.length) fail('Dead production assets', unused.join(', '));
else ok('Dead production assets','Every deployed asset and font is referenced');

// No legacy source-format references should remain.
const legacyRefMatches=[];
for (const [rel,text] of Object.entries(sourceText)) {
  const m=text.match(/\.(?:png|jpe?g|wav|ttf|otf)(?=["')\s?#]|$)/ig);
  if(m) legacyRefMatches.push(`${rel}: ${[...new Set(m)].join(', ')}`);
}
if (legacyRefMatches.length) fail('Legacy format references', legacyRefMatches.join(' | '));
else ok('Legacy format references','No runtime references to retired PNG/JPEG/WAV/TTF/OTF files');

// 5) Asset signatures.
function sig(abs,n=12){ return fs.readFileSync(abs).subarray(0,n); }
const badSignatures=[];
for (const abs of distFiles) {
  const ext=path.extname(abs).toLowerCase();
  const b=sig(abs,16);
  const r=relFrom(dist,abs);
  if(ext==='.webp' && !(b.toString('ascii',0,4)==='RIFF' && b.toString('ascii',8,12)==='WEBP')) badSignatures.push(r);
  if(ext==='.woff2' && b.toString('ascii',0,4)!=='wOF2') badSignatures.push(r);
  if(ext==='.mp3') {
    const id3=b.toString('ascii',0,3)==='ID3';
    const frame=b[0]===0xFF && (b[1]&0xE0)===0xE0;
    if(!id3 && !frame) badSignatures.push(r);
  }
}
if (badSignatures.length) fail('Asset file integrity', badSignatures.join(', '));
else ok('Asset file integrity','WebP, WOFF2 and MP3 signatures match their extensions');

// 6) CSS structural sanity.
const css=sourceText['src/styles.css'];
const open=(css.match(/{/g)||[]).length, close=(css.match(/}/g)||[]).length;
if(open!==close) fail('CSS brace balance', `${open} opening vs ${close} closing braces`);
else ok('CSS brace balance', `${open} rule blocks balanced`);

// 7) Vercel/static configuration.
try {
  const v=JSON.parse(read('vercel.json'));
  if(v.outputDirectory!=='dist' || v.buildCommand!=='npm run build') fail('Vercel configuration','Expected buildCommand npm run build and outputDirectory dist');
  else ok('Vercel configuration','Static build targets dist with npm run build');
} catch(e){ fail('Vercel configuration',e.message); }

if(/<base\s+href=["']\/["']\s*\/?/i.test(sourceText['admin/index.html'])) ok('Admin asset base','/admin uses root-relative base for shared runtime assets');
else fail('Admin asset base','admin/index.html is missing <base href="/">');

// 8) Service-worker retirement state: retained only as a cleanup shim.
const sw=read('sw.js');
if(/addEventListener\(['"]fetch['"]/.test(sw) || /caches\.open\(/.test(sw)) fail('Service-worker retirement','sw.js still intercepts or creates runtime caches');
else if(/registration\.unregister\(\)/.test(sw) && /caches\.delete/.test(sw)) ok('Service-worker retirement','Retirement shim only: no fetch interception; clears legacy caches and unregisters');
else warn('Service-worker retirement','Could not verify retirement behaviour');

// 9) Mission-route static integrity.
const runtime=sourceText['src/main.js'];
const checkpointBlock=(runtime.match(/const CHECKPOINTS = \[([\s\S]*?)\n  \];/)||[])[1]||'';
const checkpointIds=[...checkpointBlock.matchAll(/\{id:'([^']+)'/g)].map(m=>m[1]);
const checkpointTypes=[...checkpointBlock.matchAll(/type:'([^']+)'/g)].map(m=>m[1]);
const expectedIds=['gantry','entry','velocity','luffield','power','spirit','escapade','comet','jingle','lando','aurora','lapland','northern'];
if(JSON.stringify(checkpointIds)!==JSON.stringify(expectedIds)) fail('Mission route','Checkpoint route/order differs from audited baseline');
else ok('Mission route',`${checkpointIds.length} checkpoints present in expected order`);
const handled = new Set(['qr','activation','diagnostics','commsrelay','power','spirit','artifacts','comet','jingle','lando','aurora','lapland','northern']);
const unhandled=[...new Set(checkpointTypes)].filter(t=>!handled.has(t));
if(unhandled.length) fail('Mission handlers',`Unhandled checkpoint types: ${unhandled.join(', ')}`);
else ok('Mission handlers','Every route checkpoint type has an audited render/bind or automatic flow');

if(/const checks=\['luffield','power','spirit','escapade','comet','jingle','lando','aurora'\]/.test(runtime) && /const systemKeys=\['comms','power','core','propulsion','guidance','control','response','navigation'\]/.test(runtime) && !/const checks=\[[^\]]*'elf-radio'/.test(runtime)) {
  ok('Lapland Launch dependency','Final verification follows the approved MC-03 to MC-10 eight-system sequence');
} else fail('Lapland Launch dependency','Final verification dependency does not match the approved MC-03 to MC-10 system sequence');

// 10) Reindeer Raceway acceleration-game mobile protections.
const powerCssOK = /-webkit-touch-callout:none\s*!important/.test(css) && /\.power-accelerator[\s\S]*touch-action:none/.test(css);
const powerJsOK = /button\.addEventListener\(['"]contextmenu['"],e=>e\.preventDefault\(\)\)/.test(runtime);
const fixedGeometry = /--speed-stretch:1/.test(css) && !/setProperty\(['"]--speed-stretch/.test(runtime);
if(powerCssOK && powerJsOK) ok('Reindeer Raceway hold control','iOS selection/callout suppression and context-menu prevention are present');
else fail('Reindeer Raceway hold control','Long-press protection is incomplete');
if(fixedGeometry) ok('Reindeer Raceway high-speed geometry','Speed stretch remains fixed; JS does not scale scenery with velocity');
else fail('Reindeer Raceway high-speed geometry','Dynamic scene scaling appears to be present');

// 11) Circuit georeference integrity.
const georef=read('src/modules/03-circuit-georef.js');
if(/const CIRCUIT_GEOREFERENCE/.test(georef) && /function geoToCircuitPoint\(/.test(georef) && /const SILVERSTONE_GP_ROUTE/.test(georef)) {
  ok('Circuit georeference','Real-world coordinate calibration and GP route centreline are present');
} else fail('Circuit georeference','Circuit coordinate calibration is missing or incomplete');
if(/geoToCircuitPoint\(cp\?\.lat,cp\?\.lng\)/.test(runtime) && /geoToCircuitPoint\(fix\.lat,fix\.lng\)/.test(runtime) && /geoToCircuitPoint\(cfg\.lat,cfg\.lng\)/.test(runtime)) {
  ok('Coordinate single source','MC01, live radar and checkpoint markers derive SVG position from master lat/lng');
} else fail('Coordinate single source','A circuit marker still appears to bypass the master lat/lng mapping');
if(
  /beginDemoCircuitApproach/.test(runtime) &&
  /demoTrackDistance/.test(runtime) &&
  /forwardRouteDistance\(startDistance,targetProjection\.distance\)/.test(runtime) &&
  /updatePosition\(startDistance\+travelled\)/.test(runtime) &&
  !/targetProjection\.distance-remaining/.test(runtime)
) {
  ok('Circuit demo route','Post-MC01 Demo Mode persists lap position and travels continuously forward along the calibrated route');
} else fail('Circuit demo route','Demo Mode is not using continuous calibrated route progression');

if(
  /const CIRCUIT_RADAR_ZOOM=2\.3/.test(georef) &&
  /style=\"--circuit-radar-zoom:\$\{CIRCUIT_RADAR_ZOOM\}\"/.test(runtime) &&
  /\.track-radar-art\{[\s\S]*?f1-circuit\.svg/.test(css) &&
  !/CIRCUIT_RADAR_POLYLINE_POINTS/.test(runtime) &&
  !/track-radar-line/.test(runtime)
) {
  ok('Circuit radar artwork','Radar renders the original circuit SVG at the reduced 2.3x marker-matched scale');
} else fail('Circuit radar artwork','Radar is not using the original circuit SVG at the approved reduced scale');

// 12) External runtime dependencies / launch notes.
const urls=[...runtime.matchAll(/https:\/\/[^'"`\s)]+/g)].map(m=>m[0]);
const uniqueUrls=[...new Set(urls)];
if(uniqueUrls.length) notes.push(`External runtime URL(s): ${uniqueUrls.join(', ')}`);
if(runtime.includes('Test stream for ELF FM')) warn('ELF FM stream','Current build still identifies the Radio Mast URL as a test stream; replace before final public launch if a production stream is supplied');

// 13) Manifest note.
try {
  const manifest=JSON.parse(read('manifest.webmanifest'));
  if(Array.isArray(manifest.icons) && manifest.icons.length===0) warn('Web app manifest','No install icon is defined. This does not affect normal browser use, only add-to-home-screen presentation.');
} catch(e){ fail('Web app manifest',e.message); }

// Emit report.
console.log('Silverstone Mission Control — production audit');
console.log('='.repeat(48));
for(const c of checks) console.log(`PASS  ${c.name}${c.detail?` — ${c.detail}`:''}`);
for(const w of warnings) console.log(`WARN  ${w.name}${w.detail?` — ${w.detail}`:''}`);
for(const f of failures) console.log(`FAIL  ${f.name}${f.detail?` — ${f.detail}`:''}`);
for(const n of notes) console.log(`NOTE  ${n}`);
console.log('-'.repeat(48));
console.log(`${checks.length} passed, ${warnings.length} warning(s), ${failures.length} failure(s).`);
if(failures.length) process.exit(1);
