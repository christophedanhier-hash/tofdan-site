"""Contrôle des repères du catalogue ; utiliser un Python muni de Playwright.
Usage : python tools/test-zodiaque.py --url http://127.0.0.1:8994/app/constellations/index.html --output /tmp/zodiaque --chromium /chemin/chrome
"""
import argparse,json,pathlib,re
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('--url',required=True);p.add_argument('--output',required=True);p.add_argument('--chromium',required=True);a=p.parse_args()
out=pathlib.Path(a.output);out.mkdir(parents=True,exist_ok=True)
expected={'Balance','Cancer','Capricorne','Gémeaux','Lion','Poissons','Sagittaire','Scorpion','Taureau','Verseau','Vierge'}
report=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=a.chromium,args=['--no-sandbox'])
 for width in [1366,390]:
  for theme in ['light','dark']:
   ctx=b.new_context(viewport={'width':width,'height':900},locale='fr-BE',timezone_id='Europe/Brussels')
   ctx.add_init_script("localStorage.setItem('constellations.observation',JSON.stringify({mode:'toutes',lat:49.9,lon:5,nom:'OCA'}));localStorage.setItem('theme','"+theme+"');")
   page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(a.url);page.locator('.carte-btn').first.wait_for()
   page.evaluate('(t)=>document.documentElement.setAttribute("data-theme",t)',theme)
   assert page.locator('.carte-btn').count()==49
   names=set(page.locator('.carte-btn--zodiaque .carte-nom').all_text_contents());assert names==expected,(names,expected)
   assert page.locator('.liste-const .badge-zodiaque').count()==11
   assert page.locator('.liste-const .badge-ecliptique').count()==1
   for name in ['Cancer','Vierge','Ophiuchus','Orion']:
    button=page.locator('.carte-btn').filter(has=page.locator('.carte-nom',has_text=re.compile('^'+name+'$')))
    button.click();page.wait_for_function('(n)=>document.querySelector(".entete-const h2").textContent===n',arg=name)
    assert page.locator('.entete-const .badge-zodiaque').count()==int(name in expected)
    assert page.locator('.entete-const .badge-ecliptique').count()==int(name=='Ophiuchus')
   page.locator('.carte-btn').filter(has=page.locator('.carte-nom',has_text=re.compile('^Cancer$'))).click()
   page.wait_for_function('document.querySelector(".entete-const h2").textContent==="Cancer"')
   assert 'Zodiaque' in page.locator('.carte-btn--zodiaque').first.get_attribute('aria-label')
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
   page.locator('.carte-btn--zodiaque').first.focus();page.keyboard.press('Enter')
   page.wait_for_function('document.querySelector(".entete-const h2").textContent==="Balance"')
   page.screenshot(path=str(out/f'catalogue-{width}-{theme}.png'),full_page=True)
   page.locator('.legende-zodiaque summary').click()
   assert page.locator('.legende-zodiaque p').first.is_visible()
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
   assert not errors,errors
   report.append({'largeur':width,'theme':theme,'cartes':49,'badges_zodiaque':len(names),'ophiuchus_distinct':True,'clavier':True,'debordement':False,'erreurs':errors})
   ctx.close()
 b.close()
(out/'rapport.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
