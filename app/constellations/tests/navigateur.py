"""Parcours réel : python tests/navigateur.py --url ... --output /tmp/preuves --chromium ..."""
import argparse, json, pathlib, re
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:8994/app/constellations/index.html');parser.add_argument('--output',required=True);parser.add_argument('--chromium')
a=parser.parse_args();OUT=pathlib.Path(a.output);OUT.mkdir(parents=True,exist_ok=True);BASE=pathlib.Path(__file__).resolve().parents[1];idx=json.loads((BASE/'data/index.json').read_text())['constellations'];report={}
def verifier_etoiles(table,c):
 d=json.loads((BASE/'data'/c['fichier']).read_text())
 attendu=sorted(d['etoiles'],key=lambda s:(not bool(s.get('nom_iau')),s['mag']))
 rows=table.locator('.ligne-etoile');assert rows.count()==len(attendu),c['id']
 assert table.locator('thead th').all_text_contents()==['Nom','Désignation','Rôle','Éclat et observation']
 for i,s in enumerate(attendu):
  cells=rows.nth(i).locator('td');assert cells.count()==4
  assert cells.nth(0).inner_text()==s['nom'];assert cells.nth(1).inner_text()==s['bayer']
  assert s['role'] in cells.nth(2).inner_text()
  mag=str(int(s['mag']) if s['mag']==int(s['mag']) else s['mag']).replace('.',',')
  assert mag in cells.nth(3).inner_text();assert s['visibilite'] in cells.nth(3).inner_text()
 return len(attendu)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,**({'executable_path':a.chromium} if a.chromium else {}),args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1366,'height':900},timezone_id='Europe/Brussels',locale='fr-BE');page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script("localStorage.setItem('constellations.observation',JSON.stringify({mode:'toutes',lat:49.9,lon:5,nom:'OCA'}));window.print=()=>{window.__printReady=true;}")
 page.goto(a.url);page.locator('.carte-btn').first.wait_for()
 def selection(nom):
  page.get_by_role('button',name='1 · Catalogue',exact=True).click();page.locator('.carte-btn').filter(has=page.locator('.carte-nom',has_text=re.compile('^'+re.escape(nom)+'$'))).click();page.wait_for_function('(n)=>document.querySelector(".entete-const h2")?.textContent===n',arg=nom)
 results=[]
 for c in idx:
  selection(c['nom_fr']);r={'fiche':c['fichier'],'etapes':[]}
  for i,label in [(2,'Fiche'),(3,'Dessin'),(4,'Comparaison'),(5,'Objets'),(6,'Questions')]:
   page.get_by_role('button',name=f'{i} · {label}',exact=True).click();assert not page.locator('#erreur').is_visible(),c['nom_fr']+' erreur';assert len(page.locator('#ecran').inner_text().strip())>8
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),c['nom_fr']+' débordement bureau'
   if i==2:r['etoiles_triees']=verifier_etoiles(page.locator('#ecran .fiche-etoiles'),c)
   r['etapes'].append(i)
   if i==6:
    while page.get_by_role('button',name='Voir la réponse',exact=True).count():page.get_by_role('button',name='Voir la réponse',exact=True).first.click()
    assert page.locator('.reponse').count()==6;assert all(s.strip() for s in page.locator('.reponse').all_text_contents())
  page.get_by_role('button',name='🗺️ Carte du ciel',exact=True).first.click();page.locator('#carte-heure').wait_for();assert page.locator('.carte-canvas').first.is_visible();page.locator('#carte-heure').fill('720');page.locator('#carte-heure').dispatch_event('input');r['carte_fin']=page.locator('.carte-heure').inner_text();results.append(r)
  if c['id'] in ['coupe-cratere','gemini','orion','lyre']:
   page.get_by_role('button',name='2 · Fiche',exact=True).click();page.screenshot(path=str(OUT/(c['id']+'-fiche.png')),full_page=True)
 report['parcours']=results
 # Tous les écrans de toutes les fiches en petit viewport.
 page.set_viewport_size({'width':390,'height':844});mob=[]
 for c in idx:
  selection(c['nom_fr'])
  for i,label in [(1,'Catalogue'),(2,'Fiche'),(3,'Dessin'),(4,'Comparaison'),(5,'Objets'),(6,'Questions')]:
   page.get_by_role('button',name=f'{i} · {label}',exact=True).click();assert not page.locator('#erreur').is_visible();assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),c['nom_fr']+' débordement mobile '+label;mob.append({'fiche':c['fichier'],'etape':i})
   if i==2:verifier_etoiles(page.locator('#ecran .fiche-etoiles'),c)
 page.screenshot(path=str(OUT/'mobile.png'),full_page=True);report['mobile']=mob;page.set_viewport_size({'width':1366,'height':900})
 # Dessin sans souris, y compris annulation.
 selection('Orion');page.get_by_role('button',name='3 · Dessin',exact=True).click()
 pixels="""()=>{const x=document.querySelector('#ecran canvas').getContext('2d'),d=x.getImageData(0,0,800,600).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]===26&&d[i+1]===79&&d[i+2]===139)n++;return n;}"""
 before=page.evaluate(pixels);page.locator('#dessin-depart').select_option('0');page.locator('#dessin-arrivee').select_option('1');page.get_by_role('button',name='Ajouter ce trait',exact=True).focus();page.keyboard.press('Enter');after=page.evaluate(pixels);assert after>before;page.get_by_role('button',name='Annuler',exact=True).click();assert page.evaluate(pixels)==before;report['clavier_dessin']={'avant':before,'apres':after,'annulation':True}
 # Distance réelle sélectionnable au clavier, sans survol.
 selection('Céphée');page.get_by_role('button',name='4 · Comparaison',exact=True).click();options=page.locator('#comparaison-segment option').all_text_contents();target=next(i for i,s in enumerate(options) if 'μ Cep' in s and 'ε Cep' in s);page.locator('#comparaison-segment').select_option(str(target-1));assert '4,53°' in page.locator('.info-seg').inner_text();report['distance_cephee']=page.locator('.info-seg').inner_text();page.screenshot(path=str(OUT/'cephee-distance.png'),full_page=True)
 # Dernière fiche et étape réellement restaurées après rechargement.
 selection('Lion');page.get_by_role('button',name='6 · Questions',exact=True).click();page.reload();page.locator('.carte-btn').first.wait_for();assert page.locator('.entete-const h2').inner_text()=='Lion';page.get_by_role('button',name=re.compile('Reprendre')).click();assert page.locator('#ariane [aria-current=step]').inner_text()=='6 · Questions';report['reprise']=True
 # Injections de panne contrôlées : une UI d'erreur, aucune exception non traitée.
 page.get_by_role('button',name='1 · Catalogue',exact=True).click();route=re.compile(r'/data/gemini\.json(?:\?|$)');page.route(route,lambda r:r.fulfill(status=503,body='test indisponibilité'));page.locator('.carte-btn').filter(has=page.locator('.carte-nom',has_text=re.compile('^Gémeaux$'))).click();page.locator('#erreur').wait_for(state='visible');assert '503' in page.locator('#erreur').inner_text();report['http503']=page.locator('#erreur').inner_text();page.unroute(route)
 page.get_by_role('button',name='1 · Catalogue',exact=True).click();page.route(route,lambda r:r.fulfill(status=200,content_type='application/json',body='{"id":"gemini","etoiles":[]}'));page.locator('.carte-btn').filter(has=page.locator('.carte-nom',has_text=re.compile('^Gémeaux$'))).click();page.locator('#erreur').wait_for(state='visible');assert 'incomplète' in page.locator('#erreur').inner_text();report['json_invalide']=True;page.unroute(route)
 # Deux sélections lancées sans attendre : seule la seconde doit aboutir dans l'UI.
 page.get_by_role('button',name='1 · Catalogue',exact=True).click();page.evaluate("()=>{const a=[...document.querySelectorAll('.carte-btn')];a.find(b=>b.querySelector('.carte-nom').textContent==='Gémeaux').click();a.find(b=>b.querySelector('.carte-nom').textContent==='Orion').click();}");page.wait_for_function('document.querySelector(".entete-const h2").textContent==="Orion"');page.wait_for_timeout(300);assert page.locator('.entete-const h2').inner_text()=='Orion';report['course_selection']=True
 # Lieu invalide refusé partout, pas de retour silencieux à l'OCA.
 page.get_by_role('button',name='1 · Catalogue',exact=True).click();page.get_by_role('button',name='⚙ Modifier',exact=True).click();page.locator('#obs-lat').fill('999');page.locator('#obs-lat').dispatch_event('change');assert page.locator('.obs-erreur').is_visible();page.get_by_role('button',name='🗺️ Carte du ciel',exact=True).first.click();assert page.locator('.carte-canvas').count()==0;assert 'invalide' in page.locator('#ecran').inner_text().lower();report['lieu_invalide']=True
 page.get_by_role('button',name='1 · Catalogue',exact=True).click();page.locator('#obs-lat').fill('49.9');page.locator('#obs-lat').dispatch_event('change')
 # DST : comparaison à la fenêtre 21 h – 04 h réellement traversée par Date.
 report['DST']=page.evaluate("()=>['2026-01-15','2026-03-28','2026-10-24'].map(s=>{const [y,m,d]=s.split('-').map(Number);return {soir:s,attendu:(new Date(y,m-1,d+1,4)-new Date(y,m-1,d,21))/60000,obtenu:ConstVisibilite.visibilite({ra:0,dec:90},s,{lat:49.9,lon:5}).minutes}})");assert all(r['attendu']==r['obtenu'] for r in report['DST'])
 # Impression réelle des 49 : ressources chargées et PDF effectivement produit.
 page.evaluate('window.__printReady=false');page.get_by_role('button',name='🖨️ Imprimer',exact=True).click();page.get_by_role('menuitem',name='Les 49 fiches',exact=True).click();page.wait_for_function('window.__printReady===true',timeout=90000)
 for i,c in enumerate(idx):verifier_etoiles(page.locator('#impression .fiche-etoiles').nth(i),c)
 imp=page.locator('#impression').evaluate('''(z)=>({articles:z.querySelectorAll("article").length,images:z.querySelectorAll("img").length,invalides:[...z.querySelectorAll("img")].filter(i=>!i.naturalWidth).length,canvas:z.querySelectorAll("canvas").length,polaires_non_affichees:z.querySelectorAll(".imp-carte-txt").length,articles_incomplets:[...z.querySelectorAll("article")].filter(a=>a.querySelectorAll("img").length!==1||a.querySelectorAll("canvas").length+a.querySelectorAll(".imp-carte-txt").length!==2).length,texte:z.innerText})''');assert imp['articles']==49;assert imp['images']==49;assert imp['canvas']+imp['polaires_non_affichees']==98;assert imp['articles_incomplets']==0;assert imp['invalides']==0;(OUT/'impression-texte.txt').write_text(imp.pop('texte'));report['impression']=imp
 page.pdf(path=str(OUT/'49-fiches-corrigees.pdf'),format='A4',print_background=True)
 assert not errors,errors;report['erreurs_JS']=errors
 # Fuseau distant annoncé comme celui de l'appareil, sans prétendre être celui du site.
 foreign=browser.new_context(timezone_id='America/New_York',locale='fr-BE');fp=foreign.new_page();fp.goto(a.url);fp.locator('.carte-btn').first.wait_for();assert 'America/New_York' in fp.locator('#ecran').inner_text();report['fuseau_explicite']=True;foreign.close()
 browser.close()
(OUT/'tests-navigateur.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({k:v if k not in ['parcours','mobile'] else len(v) for k,v in report.items()},ensure_ascii=False,indent=2))
