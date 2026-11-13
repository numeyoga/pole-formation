import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function login(page:Page){await page.goto('/');await page.getByLabel('Identifiant',{exact:true}).fill('gestionnaire');await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');await page.getByRole('button',{name:'Se connecter',exact:true}).click();await page.getByRole('heading',{name:'Sessions accessibles',exact:true}).waitFor();}
async function fixture(page:Page){
 const csrf=await(await page.request.get('/api/auth/csrf')).json();const headers={[csrf.headerName]:csrf.token};const code=`000-SES-${9999999999999-Date.now()}`;
 const offer=await page.request.post('/api/formations',{headers,data:{code,title:code}});expect(offer.status()).toBe(201);const formation=await offer.json();expect((await page.request.post(`/api/formations/${formation.id}/activation`,{headers,data:{version:0}})).status()).toBe(204);
 const panel=page.getByRole('region',{name:'Formations',exact:true});await panel.getByRole('searchbox').fill(code);await panel.getByRole('search').getByRole('button',{name:'Rechercher les formations',exact:true}).click();await panel.getByRole('button',{name:`Gérer les sessions : ${code}`,exact:true}).click();return {dialog:page.getByRole('dialog',{name:`Sessions de la formation — ${code}`,exact:true}),code,headers,formation};
}
test('manager creates a draft and plans it without capacity or instructor, using keyboard and accessible feedback',async({page})=>{
 await login(page);const {dialog,code}=await fixture(page);
 await expect(dialog.getByRole('button',{name:'Fermer',exact:true})).toBeFocused();await expect(dialog.getByText('Aucune session pour cette formation.',{exact:true})).toBeVisible();
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 await dialog.getByLabel('Intitulé de session (obligatoire)',{exact:true}).fill('Session '+code);
 await dialog.getByLabel('Intitulé de session (obligatoire)',{exact:true}).focus();await page.keyboard.press('Tab');await expect(dialog.getByLabel('Capacité (facultative)',{exact:true})).toBeFocused();
 await dialog.getByRole('button',{name:'Créer un brouillon de session',exact:true}).click();await expect(dialog.getByRole('heading',{name:`Session ${code} — Brouillon`,exact:true})).toBeFocused();
 await dialog.getByRole('button',{name:'Planifier la session',exact:true}).click();await expect(dialog.getByRole('alert')).toContainText('Un créneau est requis');await expect(dialog.getByRole('alert')).toBeFocused();
 await dialog.getByLabel('Début (obligatoire)',{exact:true}).fill('2027-01-10T09:00');await dialog.getByLabel('Fin (obligatoire)',{exact:true}).fill('2027-01-10T10:00');await dialog.getByLabel('Décalage UTC (obligatoire)',{exact:true}).fill('+01:00');
 await page.setViewportSize({width:375,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 await dialog.getByRole('button',{name:'Ajouter un créneau au brouillon',exact:true}).click();await expect(dialog.getByText('10/01/2027 08:00 UTC — 10/01/2027 09:00 UTC',{exact:true})).toBeVisible();
 await dialog.getByRole('button',{name:'Planifier la session',exact:true}).click();await expect(dialog.getByRole('heading',{name:`Session ${code} — Planifiée`,exact:true})).toBeFocused();await expect(dialog.getByText('Sans limite de places',{exact:true})).toBeVisible();
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await dialog.screenshot({path:'test-results/session-planned-mobile.png'});
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(page.getByRole('button',{name:`Gérer les sessions : ${code}`,exact:true})).toBeFocused();
 const sessions=page.getByRole('region',{name:'Sessions accessibles',exact:true});await expect(sessions.getByRole('button',{name:'Session '+code,exact:true})).toBeVisible();
});
test('session errors preserve input and stale versions require a reload',async({page})=>{
 await login(page);const {dialog,headers,formation}=await fixture(page);
 await page.route('**/api/formations/*/sessions',async route=>{if(route.request().method()==='POST')await route.fulfill({status:400,contentType:'application/problem+json',body:JSON.stringify({detail:'Capacité invalide.',fieldErrors:{capacity:'Entier positif requis.'}})});else await route.continue();});
 await dialog.getByLabel('Intitulé de session (obligatoire)',{exact:true}).fill('Session saisie conservée');await dialog.getByLabel('Capacité (facultative)',{exact:true}).fill('12');await dialog.getByRole('button',{name:'Créer un brouillon de session',exact:true}).click();await expect(dialog.getByRole('alert')).toBeFocused();await expect(dialog.getByLabel('Capacité (facultative)',{exact:true})).toHaveAttribute('aria-invalid','true');await expect(dialog.getByLabel('Intitulé de session (obligatoire)',{exact:true})).toHaveValue('Session saisie conservée');expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 await page.unroute('**/api/formations/*/sessions');await dialog.getByRole('button',{name:'Créer un brouillon de session',exact:true}).click();await expect(dialog.getByRole('heading',{name:'Session saisie conservée — Brouillon',exact:true})).toBeVisible();
 const list=await(await page.request.get(`/api/formations/${formation.id}/sessions`)).json();const id=list[0].id;
 expect((await page.request.post(`/api/sessions/${id}/creneaux`,{headers,data:{startsAt:'2027-01-10T09:00Z',endsAt:'2027-01-10T10:00Z',version:0}})).status()).toBe(201);
 await dialog.getByRole('button',{name:'Planifier la session',exact:true}).click();await expect(dialog.getByRole('alert')).toContainText('La session a changé');await dialog.getByRole('button',{name:'Recharger la fiche',exact:true}).first().click();await expect(dialog.getByRole('listitem')).toHaveCount(1);
 await dialog.getByRole('button',{name:'Planifier la session',exact:true}).click();await expect(dialog.getByRole('heading',{name:'Session saisie conservée — Planifiée',exact:true})).toBeVisible();
});
