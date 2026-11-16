import {test,expect,type Page,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function login(page:Page,user='gestionnaire'){
  await page.goto('/');await page.getByLabel('Identifiant',{exact:true}).fill(user);await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();await page.getByRole('heading',{name:'Sessions',level:1,exact:true}).waitFor();if(user!=="intervenant")await page.goto('/referentiel/explorateur');
}
async function fixture(page:Page){
  const csrf=await(await page.request.get('/api/auth/csrf')).json();const headers={[csrf.headerName]:csrf.token};
  const code=`EXPUI-${Date.now()}`,label=`000-EXPUI-${9999999999999-Date.now()}`;
  const domainResponse=await page.request.post('/api/referentiels/domaines',{headers,data:{code,label}});expect(domainResponse.status()).toBe(201);const domain=await domainResponse.json();
  const parentResponse=await page.request.post('/api/referentiels/sous-domaines',{headers,data:{domainId:domain.id,code:code+'-SUB',label:'Sous-domaine de navigation'}});expect(parentResponse.status()).toBe(201);const parent=await parentResponse.json();
  const childResponse=await page.request.post('/api/referentiels/competences',{headers,data:{subdomainId:parent.id,code:code+'-COMP',label:'Compétence historique de navigation'}});expect(childResponse.status()).toBe(201);const child=await childResponse.json();
  return {headers,code,label,domain,parent,child};
}

async function findDomain(panel:Locator,label:string){
  await expect(panel.getByRole('list',{name:'Hiérarchie du référentiel',exact:true})).toBeVisible();
  const summary=panel.locator('summary').filter({hasText:label});
  const pagination=panel.getByRole('navigation',{name:'Pagination des domaines de l’exploration',exact:true});
  let pageNumber=1;
  while(await summary.count()===0){
    const next=pagination.getByRole('button',{name:'Page suivante',exact:true});await expect(next).toBeEnabled();await next.click();pageNumber++;
    await expect(pagination.getByText(`Page ${pageNumber}`,{exact:true})).toBeVisible();
  }
  return summary;
}

test('reference navigation reveals all three levels by keyboard and retains inactive history in search',async({page})=>{
  await login(page);const {headers,code,label,domain,parent,child}=await fixture(page);
  const panel=page.getByRole('region',{name:'Explorer le référentiel',exact:true});await panel.getByRole('button',{name:'Actualiser le référentiel',exact:true}).click();
  await page.getByRole('link',{name:'Explorer le référentiel',exact:true}).focus();await page.keyboard.press('Enter');await expect(panel.getByRole('heading',{name:'Explorer le référentiel',level:2,exact:true})).toBeFocused();
  const domainSummary=await findDomain(panel,label);await domainSummary.focus();await page.keyboard.press('Enter');
  const parentSummary=panel.locator('summary').filter({hasText:'Sous-domaine de navigation'});await expect(parentSummary).toBeVisible();await parentSummary.focus();await page.keyboard.press('Space');
  await expect(panel.getByText(`Compétence : ${code}-COMP — Compétence historique de navigation (Actif)`,{exact:true})).toBeVisible();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await panel.screenshot({path:'test-results/explorer-hierarchy-desktop.png'});
  for(const path of [`competences/${child.id}`,`sous-domaines/${parent.id}`,`domaines/${domain.id}`])expect((await page.request.post(`/api/referentiels/${path}/desactivation`,{headers,data:{version:0}})).status()).toBe(204);
  await panel.getByLabel('Code ou libellé de compétence',{exact:true}).fill(code.toLowerCase());await panel.getByRole('button',{name:'Rechercher les compétences',exact:true}).click();
  await expect(panel.getByRole('status',{name:'État de l’exploration'})).toHaveText('1 compétence(s) trouvée(s).');
  const result=panel.getByRole('list',{name:'Résultats de la recherche'});await expect(result).toContainText(`Compétence historique de navigation (Désactivé)`);
  await expect(result).toContainText(`${code} — ${label} (Désactivé) → ${code}-SUB — Sous-domaine de navigation (Désactivé) → ${code}-COMP — Compétence historique de navigation (Désactivé)`);
  await expect(panel.getByRole('heading',{name:`Résultats de la recherche : ${code.toLowerCase()}`,exact:true})).toBeFocused();
  for(const width of [2048,1440,1024,375]){
    await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await panel.screenshot({path:`test-results/explorer-search-${width}.png`});
  }
  await panel.getByLabel('Code ou libellé de compétence',{exact:true}).fill(`missing-${code}`);await panel.getByRole('button',{name:'Rechercher les compétences',exact:true}).click();await expect(panel.getByText('Aucune compétence ne correspond à cette recherche.',{exact:true})).toBeVisible();
  await panel.getByRole('button',{name:'Parcourir la hiérarchie',exact:true}).click();await expect(panel.getByRole('list',{name:'Hiérarchie du référentiel'})).toBeVisible();await expect(panel.getByLabel('Code ou libellé de compétence',{exact:true})).toHaveValue('');
});

test('reference search paginates without losing its submitted query and recovers from network errors',async({page})=>{
  await page.route('**/api/referentiels/domaines?*',route=>route.abort());await login(page);
  const panel=page.getByRole('region',{name:'Explorer le référentiel',exact:true});await expect(panel.getByRole('alert')).toHaveText('Le service est indisponible. Réessayez.');await page.unroute('**/api/referentiels/domaines?*');
  await panel.getByRole('button',{name:'Réessayer',exact:true}).click();await expect(panel.getByRole('alert')).toHaveCount(0);
  const {headers,code,parent}=await fixture(page);
  for(let index=0;index<11;index++)expect((await page.request.post('/api/referentiels/competences',{headers,data:{subdomainId:parent.id,code:`${code}-PAGE-${index}`,label:`${code} ${String(index).padStart(2,'0')}`}})).status()).toBe(201);
  await page.route('**/api/referentiels/exploration/competences?*',route=>route.abort());
  await panel.getByLabel('Code ou libellé de compétence',{exact:true}).fill(code+'-PAGE');await panel.getByRole('button',{name:'Rechercher les compétences',exact:true}).click();await expect(panel.getByRole('alert')).toHaveText('Le service est indisponible. Réessayez.');
  await page.unroute('**/api/referentiels/exploration/competences?*');await panel.getByRole('button',{name:'Réessayer',exact:true}).click();await expect(panel.getByRole('status',{name:'État de l’exploration'})).toHaveText('11 compétence(s) trouvée(s).');
  await expect(panel.getByRole('list',{name:'Résultats de la recherche'}).getByRole('listitem')).toHaveCount(10);
  await panel.getByLabel('Code ou libellé de compétence',{exact:true}).fill('unsent draft');
  const pagination=panel.getByRole('navigation',{name:'Pagination des résultats de recherche',exact:true});await pagination.getByRole('button',{name:'Page suivante',exact:true}).click();
  await expect(panel.getByText('Page 2',{exact:true})).toBeVisible();await expect(panel.getByRole('list',{name:'Résultats de la recherche'}).getByRole('listitem')).toHaveCount(1);await expect(panel.getByRole('list',{name:'Résultats de la recherche'})).toContainText(code+' 10');
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await pagination.getByRole('button',{name:'Page précédente',exact:true}).click();await expect(panel.getByRole('list',{name:'Résultats de la recherche'})).toContainText(code+' 00');
});

test('hierarchy retries a failed branch and paginates competencies while keeping keyboard focus',async({page})=>{
  await login(page);const {headers,code,label,parent}=await fixture(page);
  for(let index=0;index<11;index++)expect((await page.request.post('/api/referentiels/competences',{headers,data:{subdomainId:parent.id,code:`${code}-BRANCH-${index}`,label:`Branche ${String(index).padStart(2,'0')}`}})).status()).toBe(201);
  const panel=page.getByRole('region',{name:'Explorer le référentiel',exact:true});await panel.getByRole('button',{name:'Actualiser le référentiel',exact:true}).click();
  const domainSummary=await findDomain(panel,label);
  await page.route('**/api/referentiels/sous-domaines?*',route=>route.abort());
  await domainSummary.click();await expect(panel.getByRole('alert')).toHaveText('Le service est indisponible. Réessayez.');
  await page.unroute('**/api/referentiels/sous-domaines?*');await panel.getByRole('button',{name:`Réessayer le chargement de ${label}`,exact:true}).click();await expect(panel.getByRole('alert')).toHaveCount(0);
  const summary=panel.locator('summary').filter({hasText:'Sous-domaine de navigation'});await summary.click();await expect(panel.getByText(`Compétence : ${code}-BRANCH-0 — Branche 00 (Actif)`,{exact:true})).toBeVisible();
  const pagination=panel.getByRole('navigation',{name:`Pagination de ${code}-SUB`,exact:true});await pagination.getByRole('button',{name:'Page suivante',exact:true}).click();
  await expect(panel.getByText('Page 2',{exact:true})).toBeVisible();await expect(panel.getByText(`Compétence : ${code}-BRANCH-10 — Branche 10 (Actif)`,{exact:true})).toBeVisible();await expect(summary).toBeFocused();
  await expect(panel.getByText(`Compétence : ${code}-COMP — Compétence historique de navigation (Actif)`,{exact:true})).toBeVisible();
  await pagination.getByRole('button',{name:'Page précédente',exact:true}).click();await expect(panel.getByText(`Compétence : ${code}-BRANCH-0 — Branche 00 (Actif)`,{exact:true})).toBeVisible();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});

test('instructor cannot access reference exploration in the interface or by HTTP',async({page})=>{
  await login(page,'intervenant');await expect(page.getByRole('link',{name:'Explorer le référentiel',exact:true})).toHaveCount(0);await expect(page.getByRole('heading',{name:'Explorer le référentiel',level:2,exact:true})).toHaveCount(0);
  expect((await page.request.get('/api/referentiels/exploration/competences?q=SEC')).status()).toBe(403);
});
