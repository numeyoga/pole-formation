import { test,expect,type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function login(page:Page){
 await page.goto('/');await page.getByLabel('Identifiant',{exact:true}).fill('gestionnaire');await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');await page.getByRole('button',{name:'Se connecter',exact:true}).click();await page.getByRole('heading',{name:'Sessions',level:1,exact:true}).waitFor();
}
async function fixture(page:Page,count=1){
 const csrf=await(await page.request.get('/api/auth/csrf')).json();const headers={[csrf.headerName]:csrf.token};
 const tag=`000-FOR-${9999999999999-Date.now()}`;
 // Reuse the seeded active domain; catalogue codes follow the existing lifecycle test convention.
 const subdomain=await(await page.request.post('/api/referentiels/domaines/50000000-0000-0000-0000-000000000001/sous-domaines',{headers,data:{code:tag,label:'Sous-domaine couverture exemple'}})).json();
 const competencies=[];
 for(let i=0;i<count;i++){
  const response=await page.request.post('/api/referentiels/competences',{headers,data:{subdomainId:subdomain.id,code:`${tag}-${i}`,label:`${tag} Compétence ${String(i).padStart(2,'0')}`}});expect(response.status()).toBe(201);competencies.push(await response.json());
 }
 const formationResponse=await page.request.post('/api/formations',{headers,data:{code:tag,title:tag}});expect(formationResponse.status()).toBe(201);const formation=await formationResponse.json();
 expect((await page.request.post(`/api/formations/${formation.id}/activation`,{headers,data:{version:0}})).status()).toBe(204);
 return {headers,formation,competencies,tag};
}
async function open(page:Page,title:string){
 await page.getByRole('link',{name:'Catalogue',exact:true}).click();await page.getByRole('button',{name:'Actualiser les formations',exact:true}).click();const trigger=page.getByRole('button',{name:`Compétences de la formation : ${title}`,exact:true});await trigger.focus();await page.keyboard.press('Enter');
 const dialog=page.getByRole('dialog',{name:'Compétences de la formation',exact:true});await expect(dialog.getByRole('heading',{name:'Compétences de la formation',exact:true})).toBeFocused();return {dialog,trigger};
}

test('manager associates a competency by keyboard, sees duplicates and inactive history, with axe checks',async({page},testInfo)=>{
 await login(page);const {headers,formation,competencies,tag}=await fixture(page);const {dialog,trigger}=await open(page,tag);
 await expect(dialog.getByText('Aucune compétence associée.',{exact:true})).toBeVisible();
 const search=dialog.getByRole('searchbox',{name:'Rechercher une compétence par code ou libellé',exact:true});await search.focus();await page.keyboard.type(tag);await page.keyboard.press('Enter');
 const choice=dialog.getByRole('radio',{name:`${competencies[0].code} — ${competencies[0].label}`,exact:true});await expect(choice).toBeVisible();
 await choice.focus();await choice.check();await page.keyboard.press('Tab');await expect(dialog.getByRole('button',{name:'Associer la compétence',exact:true})).toBeFocused();await page.keyboard.press('Enter');
 await expect(dialog.getByRole('status')).toHaveText('Compétence associée.');await expect(dialog.getByRole('heading',{name:'Compétences de la formation',exact:true})).toBeFocused();await expect(dialog.getByRole('region',{name:'Compétences déjà associées',exact:true}).getByRole('listitem')).toHaveText(`${competencies[0].code} — ${competencies[0].label} — Active`);
 // Search again after the saved list refresh reset the choices page.
 await search.fill(tag);await search.press('Enter');await choice.check();await dialog.getByRole('button',{name:'Associer la compétence',exact:true}).click();
 await expect(dialog.getByRole('alert')).toContainText('déjà associée');await expect(dialog.getByRole('alert')).toBeFocused();expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 for(const width of [2048,1440,1024,375]){await page.setViewportSize({width,height:900});expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);}
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await page.screenshot({path:testInfo.outputPath('association-mobile.png')});await page.setViewportSize({width:1440,height:900});
 expect((await page.request.post(`/api/referentiels/competences/${competencies[0].id}/desactivation`,{headers,data:{version:0}})).status()).toBe(204);
 await dialog.getByRole('button',{name:'Actualiser les compétences',exact:true}).click();await expect(dialog.getByRole('region',{name:'Compétences déjà associées',exact:true}).getByRole('listitem')).toContainText('Inactive');await expect(choice).toHaveCount(0);
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused();
 expect((await page.request.post(`/api/formations/${formation.id}/archivage`,{headers,data:{version:1}})).status()).toBe(204);
 await trigger.click();await expect(dialog.getByRole('region',{name:'Compétences déjà associées',exact:true}).getByRole('listitem')).toContainText('Inactive');await expect(dialog.getByRole('searchbox')).toHaveCount(0);expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 await page.setViewportSize({width:375,height:812});expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await dialog.getByRole('button',{name:'Fermer',exact:true}).click();await expect(trigger).toBeFocused();
});

test('coverage and choices paginate, retry network failures and reject a deactivated selection',async({page})=>{
 await login(page);const {headers,formation,competencies,tag}=await fixture(page,11);
 for(const competency of competencies)expect((await page.request.post(`/api/formations/${formation.id}/competences`,{headers,data:{competencyId:competency.id}})).status()).toBe(201);
 const {dialog}=await open(page,tag);await expect(dialog.getByRole('region',{name:'Compétences déjà associées',exact:true}).getByRole('listitem')).toHaveCount(10);
 const pages=dialog.getByRole('navigation',{name:'Pages des compétences associées',exact:true});await pages.getByRole('button',{name:'Page suivante',exact:true}).click();await expect(dialog.getByRole('region',{name:'Compétences déjà associées',exact:true}).getByRole('listitem')).toHaveCount(1);await expect(pages.getByText('Page 2 sur 2',{exact:true})).toBeVisible();
 const search=dialog.getByRole('searchbox');await search.fill(tag);await search.press('Enter');const choices=dialog.getByRole('navigation',{name:'Pages des compétences disponibles',exact:true});await choices.getByRole('button',{name:'Page suivante',exact:true}).click();await expect(choices.getByText('Page 2 sur 2',{exact:true})).toBeVisible();
 await page.route('**/api/formations/competences-disponibles?*',route=>route.abort());await dialog.getByRole('button',{name:'Actualiser les compétences',exact:true}).click();await expect(dialog.getByRole('alert')).toContainText('indisponible');await expect(dialog.getByRole('button',{name:'Associer la compétence',exact:true})).toBeDisabled();
 await page.unroute('**/api/formations/competences-disponibles?*');await dialog.getByRole('button',{name:'Réessayer le chargement',exact:true}).click();await expect(dialog.getByRole('alert')).toHaveCount(0);
 const choice=dialog.getByRole('radio',{name:`${competencies[0].code} — ${competencies[0].label}`,exact:true});await choice.check();
 expect((await page.request.post(`/api/referentiels/competences/${competencies[0].id}/desactivation`,{headers,data:{version:0}})).status()).toBe(204);
 await dialog.getByRole('button',{name:'Associer la compétence',exact:true}).click();await expect(dialog.getByRole('alert')).toContainText('désactivée');await expect(dialog.getByRole('alert')).toBeFocused();
 await dialog.getByRole('button',{name:'Fermer',exact:true}).focus();await page.keyboard.press('Shift+Tab');await expect(dialog.getByRole('button',{name:'Actualiser les compétences',exact:true})).toBeFocused();await page.keyboard.press('Tab');await expect(dialog.getByRole('button',{name:'Fermer',exact:true})).toBeFocused();
});

test('an empty coverage list keeps available competencies visible beside their own pagination',async({page},testInfo)=>{
 await login(page);const {tag,competencies}=await fixture(page,11);const {dialog}=await open(page,tag);
 const associated=dialog.getByRole('region',{name:'Compétences déjà associées',exact:true});await expect(associated.getByText('Aucune compétence associée.',{exact:true})).toBeVisible();
 const available=dialog.getByRole('region',{name:'Compétences à associer',exact:true});const search=available.getByRole('searchbox');await search.fill(tag);await search.press('Enter');
 await expect(available.getByRole('radio')).toHaveCount(10);await expect(available.getByRole('radio').first()).toBeVisible();await expect(available.getByText('11 compétence(s) disponible(s).',{exact:true})).toBeVisible();
 await available.getByRole('radio').first().focus();await page.keyboard.press('Space');await page.keyboard.press('ArrowDown');await expect(available.getByRole('radio').nth(1)).toBeChecked();await expect(available.getByRole('radio').nth(1)).toBeFocused();
 const pages=available.getByRole('navigation',{name:'Pages des compétences disponibles',exact:true});await pages.getByRole('button',{name:'Page suivante',exact:true}).click();
 await expect(pages.getByText('Page 2 sur 2',{exact:true})).toBeVisible();await expect(available.getByRole('radio')).toHaveCount(1);const choice=available.getByRole('radio',{name:`${competencies[10].code} — ${competencies[10].label}`,exact:true});await expect(choice).toBeVisible();await expect(choice).not.toBeChecked();await expect(available.getByRole('heading')).toBeFocused();
 await expect(associated.getByText('Aucune compétence associée.',{exact:true})).toBeVisible();await expect(associated.getByRole('navigation')).toHaveCount(0);
 await choice.focus();await page.keyboard.press('Space');await expect(choice).toBeChecked();await available.getByRole('button',{name:'Associer la compétence',exact:true}).click();await expect(associated.getByRole('listitem')).toHaveText(`${competencies[10].code} — ${competencies[10].label} — Active`);
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await page.setViewportSize({width:375,height:812});expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await page.screenshot({path:testInfo.outputPath('pagination-competences-mobile.png')});
});
