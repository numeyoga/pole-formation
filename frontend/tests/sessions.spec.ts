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
 await dialog.getByRole('button',{name:'Ajouter un créneau',exact:true}).click();await expect(dialog.getByRole('list',{name:'Créneaux de la session',exact:true}).getByRole('listitem').filter({hasText:'10/01/2027 08:00 UTC — 10/01/2027 09:00 UTC'})).toBeVisible();
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
 await dialog.getByRole('button',{name:'Planifier la session',exact:true}).click();await expect(dialog.getByRole('alert')).toContainText('La session a changé');await dialog.getByRole('button',{name:'Recharger la fiche',exact:true}).first().click();await expect(dialog.getByRole('list',{name:'Créneaux de la session',exact:true}).getByRole('listitem')).toHaveCount(1);
 await dialog.getByRole('button',{name:'Planifier la session',exact:true}).click();await expect(dialog.getByRole('heading',{name:'Session saisie conservée — Planifiée',exact:true})).toBeVisible();
});

test('planned slots warn about real conflicts, allow cancellation and explicit confirmation, and audit actual changes',async({page})=>{
 await login(page);const {dialog,headers,formation,code}=await fixture(page);
 async function planned(title:string,start:string,end:string){
  const created=await page.request.post(`/api/formations/${formation.id}/sessions`,{headers,data:{title}});expect(created.status()).toBe(201);const item=await created.json();
  const slot=await page.request.post(`/api/sessions/${item.id}/creneaux`,{headers,data:{startsAt:start,endsAt:end,version:0}});expect(slot.status()).toBe(201);
  expect((await page.request.post(`/api/sessions/${item.id}/planification`,{headers,data:{version:1}})).status()).toBe(204);
  expect((await page.request.put(`/api/sessions/${item.id}/intervenants`,{headers,data:{instructorIds:['10000000-0000-0000-0000-000000000001'],confirmConflicts:true}})).status()).toBe(204);return item;
 }
 const target=await planned('Cible '+code,'2027-04-10T09:00Z','2027-04-10T10:00Z');await planned('Autre '+code,'2030-04-10T09:00Z','2030-04-10T10:00Z');
 await dialog.getByRole('button',{name:'Actualiser les sessions',exact:true}).click();await dialog.getByRole('button',{name:'Ouvrir la session Cible '+code,exact:true}).click();
 await dialog.getByLabel('Début (obligatoire)',{exact:true}).fill('2030-04-10T09:00');await dialog.getByLabel('Fin (obligatoire)',{exact:true}).fill('2030-04-10T10:00');
 await dialog.getByRole('button',{name:'Ajouter un créneau',exact:true}).click();await expect(dialog.getByRole('alert')).toContainText('Conflits de planning');await expect(dialog.getByRole('alert')).toBeFocused();
 await expect(dialog.getByLabel('Début (obligatoire)',{exact:true})).toBeDisabled();expect((await(await page.request.get(`/api/sessions/${target.id}`)).json()).slots).toHaveLength(1);
 await page.setViewportSize({width:375,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await dialog.screenshot({path:'test-results/slot-conflict-mobile.png'});
 await dialog.getByRole('button',{name:'Abandonner ce changement',exact:true}).click();await expect(dialog.getByLabel('Début (obligatoire)',{exact:true})).toBeFocused();await expect(dialog.getByLabel('Début (obligatoire)',{exact:true})).toHaveValue('2030-04-10T09:00');
 await dialog.getByRole('button',{name:'Ajouter un créneau',exact:true}).click();await dialog.getByRole('button',{name:'Confirmer malgré les conflits',exact:true}).click();await expect(dialog.getByRole('status')).toHaveText('Créneau ajouté.');await expect(dialog.getByRole('list',{name:'Créneaux de la session',exact:true}).getByRole('listitem')).toHaveCount(2);
 await dialog.getByRole('button',{name:'Modifier ce créneau : 10/04/2030 09:00 UTC',exact:true}).click();await expect(dialog.getByLabel('Début (obligatoire)',{exact:true})).toBeFocused();await dialog.getByLabel('Fin (obligatoire)',{exact:true}).fill('2030-04-10T11:00');
 await dialog.getByRole('button',{name:'Enregistrer le créneau',exact:true}).click();await expect(dialog.getByRole('alert')).toContainText('Conflits de planning');await dialog.getByRole('button',{name:'Confirmer malgré les conflits',exact:true}).click();await expect(dialog.getByRole('status')).toHaveText('Créneau modifié.');
 await dialog.getByLabel('Début (obligatoire)',{exact:true}).fill('2030-04-10T10:00');await dialog.getByLabel('Fin (obligatoire)',{exact:true}).fill('2030-04-10T10:30');await dialog.getByRole('button',{name:'Ajouter un créneau',exact:true}).click();await expect(dialog.getByRole('alert')).toContainText('ne peuvent pas se chevaucher');await expect(dialog.getByRole('button',{name:'Confirmer malgré les conflits',exact:true})).toHaveCount(0);
 await dialog.getByLabel('Début (obligatoire)',{exact:true}).fill('2030-04-10T11:00');await dialog.getByLabel('Fin (obligatoire)',{exact:true}).fill('2030-04-10T12:00');await dialog.getByRole('button',{name:'Ajouter un créneau',exact:true}).click();await dialog.getByRole('button',{name:'Confirmer malgré les conflits',exact:true}).click();await expect(dialog.getByRole('status')).toHaveText('Créneau ajouté.');await expect(dialog.getByRole('list',{name:'Créneaux de la session',exact:true}).getByRole('listitem')).toHaveCount(3);
 const events=await(await page.request.get(`/api/audit?sessionId=${target.id}&subjectType=CRENEAU`)).json();expect(events.items.map((event:{action:string})=>event.action)).toEqual(['AJOUT_CRENEAU','MODIFICATION_CRENEAU','AJOUT_CRENEAU']);
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await page.keyboard.press('Escape');await page.getByRole('button',{name:'Journal',exact:true}).click();
 const journal=page.getByRole('region',{name:'Journal des changements sensibles',exact:true});await journal.getByLabel('Type d’objet',{exact:true}).selectOption('CRENEAU');await journal.getByLabel('Session',{exact:true}).selectOption(target.id);await journal.getByRole('button',{name:'Filtrer le journal',exact:true}).click();await expect(journal.getByRole('heading',{name:'Ajout de créneau',exact:true})).toHaveCount(2);await expect(journal.getByRole('heading',{name:'Modification de créneau',exact:true})).toBeVisible();
});

test('coanimation selects several instructors with keyboard and saves the entire session assignment',async({page})=>{
 await login(page);const {dialog,code,headers}=await fixture(page);
 const first=await(await page.request.post('/api/intervenants',{headers,data:{firstName:'Alpha',lastName:code}})).json();
 const second=await(await page.request.post('/api/intervenants',{headers,data:{firstName:'Beta',lastName:code}})).json();
 await dialog.getByLabel('Intitulé de session (obligatoire)',{exact:true}).fill('Coanimation '+code);await dialog.getByRole('button',{name:'Créer un brouillon de session',exact:true}).click();
 const assignments=dialog.getByRole('region',{name:'Gérer la coanimation',exact:true});
 await assignments.getByLabel('Rechercher un intervenant actif',{exact:true}).fill(code);await assignments.getByRole('button',{name:'Rechercher les intervenants actifs',exact:true}).click();
 const alpha=assignments.getByRole('checkbox',{name:'Alpha '+code,exact:true});await alpha.focus();await page.keyboard.press('Space');await expect(alpha).toBeChecked();
 await assignments.getByRole('checkbox',{name:'Beta '+code,exact:true}).check();
 await assignments.getByRole('button',{name:'Enregistrer les affectations',exact:true}).click();await expect(dialog.getByRole('status').first()).toHaveText('Affectations enregistrées.');
 const assigned=dialog.getByRole('region',{name:'Intervenants de la session',exact:true});await expect(assigned.getByRole('listitem')).toHaveCount(2);
 await page.setViewportSize({width:375,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 await assignments.getByRole('checkbox',{name:'Alpha '+code,exact:true}).uncheck();await assignments.getByRole('button',{name:'Enregistrer les affectations',exact:true}).click();await expect(assigned.getByRole('listitem')).toHaveCount(1);await expect(assigned).toContainText('Beta '+code);
 expect(first.id).not.toBe(second.id);
});

test('coanimation warns, rolls back, and supports explicit confirmation on a planned session',async({page})=>{
 await login(page);const {dialog,headers,formation,code}=await fixture(page);
 const instructor=await(await page.request.post('/api/intervenants',{headers,data:{firstName:'Conflit',lastName:code}})).json();
 async function scheduled(title:string){const s=await(await page.request.post(`/api/formations/${formation.id}/sessions`,{headers,data:{title}})).json();expect((await page.request.post(`/api/sessions/${s.id}/creneaux`,{headers,data:{startsAt:'2036-01-10T09:00Z',endsAt:'2036-01-10T10:00Z',version:0}})).status()).toBe(201);expect((await page.request.post(`/api/sessions/${s.id}/planification`,{headers,data:{version:1}})).status()).toBe(204);return s;}
 const first=await scheduled('Déjà affectée '+code),target=await scheduled('Coanimation cible '+code);
 expect((await page.request.put(`/api/sessions/${first.id}/intervenants`,{headers,data:{instructorIds:[instructor.id],version:2,confirmConflicts:true}})).status()).toBe(204);
 await dialog.getByRole('button',{name:'Actualiser les sessions',exact:true}).click();await dialog.getByRole('button',{name:'Ouvrir la session Coanimation cible '+code,exact:true}).click();
 const assignments=dialog.getByRole('region',{name:'Gérer la coanimation',exact:true});await assignments.getByLabel('Rechercher un intervenant actif',{exact:true}).fill(code);await assignments.getByRole('button',{name:'Rechercher les intervenants actifs',exact:true}).click();await assignments.getByRole('checkbox',{name:'Conflit '+code,exact:true}).check();await assignments.getByRole('button',{name:'Enregistrer les affectations',exact:true}).click();
 await expect(assignments.getByRole('alert')).toBeFocused();expect((await(await page.request.get(`/api/sessions/${target.id}`)).json()).instructors).toHaveLength(0);expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 await assignments.getByRole('button',{name:'Abandonner les affectations',exact:true}).click();await expect(assignments.getByLabel('Rechercher un intervenant actif',{exact:true})).toBeFocused();await assignments.getByRole('button',{name:'Enregistrer les affectations',exact:true}).click();await assignments.getByRole('button',{name:'Confirmer les affectations malgré les conflits',exact:true}).click();await expect(dialog.getByRole('region',{name:'Intervenants de la session',exact:true})).toContainText('Conflit '+code);
 expect((await(await page.request.get(`/api/audit?sessionId=${target.id}&subjectType=AFFECTATIONS`)).json()).items).toHaveLength(1);
});
