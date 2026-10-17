/* Tests sans dépendance : node app/constellations/tests/qualite.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const base = path.resolve(__dirname, '..');
process.env.TZ = 'Europe/Brussels';
const document = {getElementById: () => ({}), querySelectorAll: () => [], documentElement: {getAttribute: () => 'light'}};
const window = {addEventListener: () => {}, location: {href: 'http://localhost/app/constellations/index.html'}};
const context = {document, window, localStorage: {getItem: () => null, setItem: () => {}}, fetch: () => new Promise(() => {}), console, Date, Intl, setTimeout, clearTimeout};
vm.createContext(context);
const code = fs.readFileSync(path.join(base, 'app.js'), 'utf8');
const exportTests = 'window.__qualite = {etat:etat, etoilesOrdonnees:etoilesOrdonnees, distanceLiaison:distanceLiaison, fmtAL:fmtAL, magnitudeLisible:magnitudeLisible, projeter:projeter, visibilite:visibilite, centre:centre, hauteur:hauteur};';
assert(code.endsWith('})();\n') || code.endsWith('})();'));
vm.runInContext(code.replace(/\}\)\(\);\s*$/, exportTests + '\n})();'), context);
const api = window.__qualite;
const read = f => JSON.parse(fs.readFileSync(path.join(base, f), 'utf8'));
const index = read('data/index.json').constellations;
const canonical = new Map(read('catalogue-etoiles.json').etoiles.map(s => [s.id, s]));
const snapshot = read('tests/sources/catalogues-20261015.json');
const origineNGC = new Map(snapshot.OpenNGC.map(o => [o.Name, o]));
const result = {fiches: 0, etoiles: 0, identites: canonical.size, segments: 0, objets: 0, svg: 0, questions: 0, testsMoteur: 0};
function separation(a,b) {
  // atan2(produit vectoriel, produit scalaire), indépendant de acos utilisé en production.
  const d=Math.PI/180;
  const v=s=>[Math.cos(s.dec_deg*d)*Math.cos(s.ra_deg*d),Math.cos(s.dec_deg*d)*Math.sin(s.ra_deg*d),Math.sin(s.dec_deg*d)];
  const u=v(a), w=v(b), cross=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];
  return Math.atan2(Math.hypot(...cross),u[0]*w[0]+u[1]*w[1]+u[2]*w[2])/d;
}
function near(a,b,tolerance,label){assert(Math.abs(a-b)<tolerance,label+': '+a+' / '+b);}
for (const c of index) {
  const d=read('data/'+c.fichier), seen=new Set(), objects=new Set();
  assert.equal(d.nom_fr,c.nom_fr);assert.equal(d.id,c.id);assert(d.repere_principal && d.message_animation);
  assert.equal(typeof d.voie_lactee,'boolean');assert(d.voie_lactee_definition);
  api.etat.data=d;result.fiches++;result.etoiles+=d.etoiles.length;result.objets+=d.objets_ciel_profond.length;
  const avant=JSON.stringify(d.etoiles), tries=api.etoilesOrdonnees(d.etoiles);
  assert.equal(JSON.stringify(d.etoiles),avant,'ordre interne immuable');
  assert.equal(tries.length,d.etoiles.length);
  assert.equal(new Set(tries).size,d.etoiles.length,'aucune perte ni duplication');
  for(let i=1;i<tries.length;i++) {
    assert(!tries[i].nom_iau || tries[i-1].nom_iau,'noms propres en premier');
    if(Boolean(tries[i].nom_iau)===Boolean(tries[i-1].nom_iau)) assert(tries[i-1].mag<=tries[i].mag,'magnitudes croissantes');
  }
  const svg=fs.readFileSync(path.join(base,c.figure_svg),'utf8');result.svg++;
  const texts=[...svg.matchAll(/<text[^>]*>(.*?)<\/text>/g)].map(m=>m[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>'));
  assert.equal(texts.length,d.etoiles.length,c.id+' nombre étiquettes');
  for (const s of d.etoiles) {
    assert(!seen.has(s.identifiant),c.id+' identité dupliquée');seen.add(s.identifiant);
    const ref=canonical.get(s.identifiant);assert(ref,s.nom+' identité absente');
    const brut=snapshot.simbad[s.identifiant.split(':')[1]];assert(brut,s.nom+' réponse primaire absente');
    assert.equal(s.type_spectral,brut.reference.sp_type);assert.equal(s.simbad_id,brut.reference.main_id);
    if(s.bande_mag==='V' && !(s.source_mag.url||'').includes('wikipedia.org'))assert.equal(s.mag,brut.photometrie.V,s.nom+' magnitude primaire');
    assert.equal(s.nom,ref.nom_fr);assert.equal(s.etiq,s.nom);assert(texts.includes(s.nom),c.id+' '+s.nom+' absent du SVG');
    for (const field of ['type_spectral','nature_stellaire','mag','bande_mag','bayer'])assert.equal(s[field],ref[field],c.id+' '+s.nom+' '+field);
    assert(s.source_type.url && s.source_type.identifiant===s.simbad_id);
    assert.equal(s.constellation_iau,ref.constellation_iau);
    if(s.constellation_iau!==c.abreviation)assert(s.alerte.includes('Repère voisin'));
    if(s.nom==='10 UMa'){assert.equal(s.constellation_iau,'Lyn');assert(!/Repère voisin/.test(s.alerte||''));}
    near(separation(s,{ra_deg:ref.ra_simbad_deg,dec_deg:ref.dec_simbad_deg}),0,.02,s.nom+' écart identité/coordonnée');
    assert(!/naine blanche/i.test(s.role),s.nom+' fausse naine blanche');
    assert(!/^(?:Alpha|Beta|Gamma|Delta|Epsilon|Zeta|Eta|Theta|Iota|Kappa|Lambda|Mu|Nu|Xi|Omicron|Rho|Sigma|Tau) /i.test(s.nom),s.nom+' translittération anglaise');
    assert(s.role.includes(' — '));
    assert(!/Passe par|Jonction de|Maillon|Extrémité du tracé/.test(s.role));
    assert(Number.isFinite(s.ra_deg)&&Number.isFinite(s.dec_deg));
    assert(s.ra_deg>=0&&s.ra_deg<360&&Math.abs(s.dec_deg)<=90);
  }
  let n=0;
  for (const chain of d.figure.liaisons) {
    assert(chain.length>=2);
    for (const i of chain)assert(Number.isInteger(i)&&d.etoiles[i]);
    for(let i=1;i<chain.length;i++) {
      const a=chain[i-1],b=chain[i],expected=separation(d.etoiles[a],d.etoiles[b]);
      near(api.distanceLiaison(a,b),Math.round(expected*100)/100,1e-8,c.id+' fonction réelle, arrondi affiché');
      near(api.distanceLiaison(b,a),Math.round(expected*100)/100,1e-8,c.id+' symétrie');
      const stored=d.distances_angulaires_deg[n++];assert.equal(stored.a,a);assert.equal(stored.b,b);near(stored.deg,expected,.000051,c.id+' schéma');
      result.segments++;
    }
  }
  assert.equal(n,d.distances_angulaires_deg.length);
  assert.equal(api.distanceLiaison(-1,0),null);
  for(const o of d.objets_ciel_profond){
    const key=o.identifiant_catalogue||o.id;assert(!objects.has(key),c.id+' doublon objet');objects.add(key);
    if(o.identifiant_catalogue){const ngc=origineNGC.get(o.identifiant_catalogue);assert(ngc);assert.equal(o.constellation_catalogue,ngc.Const);}
    if(o.source_distance.statut==='publication primaire recoupée'){
      const ligne=snapshot.Baumgardt_lignes_table_NGC.find(r=>r[0]===o.source_distance.entree);assert(ligne);
      const kpc=Number(ligne[3].split('±')[0].trim());
      const pcAL=(648000/Math.PI)*149597870700/(299792458*365.25*86400);
      near(o.distance_al,kpc*1000*pcAL,.51,o.id+' distance primaire convertie');assert.equal(o.mag,Number(ligne[8].split('±')[0].trim()));
    }
    if(o.constellation_catalogue)assert([d.abreviation_iau,...(d.abreviation_iau==='Ser'?['Se1','Se2']:[])].includes(o.constellation_catalogue),c.id+' objet étranger');
    assert(!/\b(?:vB|vL|glob\. cl\.|psbM|rrr)\b|documenté\(e\)|un\(e\)/.test(o.note),c.id+' sténographie');
    assert(o.source_distance && o.conseil_observation);
    assert(!/dupliquée|nature à préciser/.test(o.nature));
    if(o.mag!==null)assert(Number.isFinite(o.mag));
  }
  for(const key of ['questions_guide','questions_observation'])for(const q of d[key]){assert(typeof q.q==='string'&&q.q.trim()&&typeof q.r==='string'&&q.r.trim());assert(!/documenté\(e\)|un\(e\)|glob\. cl\./.test(q.r));result.questions++;}
  if(c.id==='coupe-cratere'){
    const b=d.etoiles.find(s=>s.bayer==='β Crt'),delta=d.etoiles.find(s=>s.bayer==='δ Crt'),gamma=d.etoiles.find(s=>s.bayer==='γ Crt');
    assert(b.mag>delta.mag);assert(b.type_spectral.startsWith('A'));assert(gamma.type_spectral.startsWith('A'));
    assert(gamma.role.startsWith('Sommet est'));assert(gamma.ra_deg>d.etoiles.find(s=>s.nom==='Alkes').ra_deg);
  }
}
for(const [s,expected] of [['2026-01-15',420],['2026-03-28',360],['2026-10-24',480]]){
  assert.equal(api.visibilite({ra:0,dec:90},s,{lat:49.9,lon:5}).minutes,expected,s+' changement heure');result.testsMoteur++;
}
near(api.hauteur(0,90,new Date('2026-01-15T20:00:00Z'),49.9,5),49.9,1e-8,'pôle nord');
near(api.hauteur(0,-90,new Date('2026-01-15T20:00:00Z'),49.9,5),-49.9,1e-8,'pôle sud');
const centre=api.centre([{ra_deg:359,dec_deg:0},{ra_deg:1,dec_deg:0}]);near(Math.min(centre.ra,360-centre.ra),0,1e-8,'passage RA zéro');
assert.equal(api.visibilite({ra:0,dec:90},'2026-01-15',{lat:999,lon:5}),null);
assert.equal(api.visibilite({ra:0,dec:90},'2026-01-15',{lat:49.9,lon:999}),null);
assert.equal(api.fmtAL(9999),'10\u202f000\u00a0a.l.');
assert.equal(api.fmtAL(999999),"1\u00a0million\u00a0d'a.l.");
result.testsMoteur+=7;
assert.equal(result.fiches,49);assert.equal(result.etoiles,453);assert.equal(result.segments,452);assert.equal(result.svg,49);
console.log(JSON.stringify(result,null,2));
