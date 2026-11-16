import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {revealProfile} from './helpers/profiles';

async function login(page:Page,user='gestionnaire',path='/sessions'){
  await page.goto(path);
  await page.getByLabel('Identifiant',{exact:true}).fill(user);
  await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();
  await expect(page.getByRole('button',{name:'Se déconnecter',exact:true})).toBeVisible();
}
async function headers(page:Page){const token=await(await page.request.get('/api/auth/csrf')).json();return {[token.headerName]:token.token};}

test('profile detail opens from the list, edits information and shares each section',async({page})=>{
  await login(page);
  const token=await headers(page),code='DETAIL-P-'+Date.now();
  const response=await page.request.post('/api/referentiels/profils-emploi',{headers:token,data:{code,label:code,description:'Description de recette fictive'}});
  expect(response.status()).toBe(201);const item=await response.json();
  await page.getByRole('link',{name:'Profils d’emploi',exact:true}).click();
  const row=await revealProfile(page,code);
  await row.getByRole('link',{name:code,exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`/profils/${item.id}/presentation$`));
  await expect(page.getByRole('heading',{name:code,exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Modifier',exact:true}).click();
  const editor=page.getByRole('dialog',{name:'Modifier un profil',exact:true});
  await editor.getByLabel('Description',{exact:true}).fill('Description modifiée depuis la fiche');
  await editor.getByRole('button',{name:'Enregistrer le profil',exact:true}).click();
  await expect(page.getByRole('region',{name:code,exact:true}).getByText('Description modifiée depuis la fiche',{exact:true})).toBeVisible();
  await page.getByRole('link',{name:'Exigences',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Exigences du profil',exact:true})).toBeVisible();
  await page.screenshot({path:'test-results/profile-detail-desktop.png'});
  await page.getByRole('button',{name:'Associer une compétence',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'Associer une compétence',exact:true})).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goForward();
  await page.getByRole('link',{name:'Formations correspondantes',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Formations pertinentes',exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading',{name:'Formations pertinentes',exact:true})).toBeVisible();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.getByRole('link',{name:'Retour aux profils',exact:true}).click();
  await expect(page.getByRole('region',{name:'Profils d’emploi',exact:true})).toBeVisible();
});

test('collaborator detail preserves list search, edits identity and displays participation history',async({page})=>{
  await login(page);
  const token=await headers(page),code='DETAIL-C-'+Date.now();
  const response=await page.request.post('/api/collaborateurs',{headers:token,data:{professionalId:code,firstName:'Ada',lastName:code}});
  expect(response.status()).toBe(201);const item=await response.json();
  await page.getByRole('link',{name:'Collaborateurs',exact:true}).click();
  const list=page.getByRole('region',{name:'Collaborateurs',exact:true});
  await list.getByRole('searchbox').fill(code);
  await list.getByRole('button',{name:'Rechercher les collaborateurs',exact:true}).click();
  await list.getByRole('link',{name:'Ada '+code,exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`/collaborateurs/${item.id}/informations$`));
  await page.getByRole('button',{name:'Modifier',exact:true}).click();
  const editor=page.getByRole('dialog',{name:'Modifier un collaborateur',exact:true});
  await editor.getByLabel('Prénom (obligatoire)',{exact:true}).fill('Alice');
  await editor.getByRole('button',{name:'Enregistrer le collaborateur',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Alice '+code,exact:true})).toBeFocused();
  await page.getByRole('link',{name:'Participations',exact:true}).click();
  await expect(page.getByText('Aucune participation pour ce collaborateur.',{exact:true})).toBeVisible();
  await page.getByRole('link',{name:'Retour aux collaborateurs',exact:true}).click();
  await expect(list.getByRole('searchbox')).toHaveValue(code);
  await list.getByRole('link',{name:'Alice '+code,exact:true}).click();
  await page.getByRole('link',{name:'Participations',exact:true}).click();
  await page.reload();
  await page.setViewportSize({width:375,height:812});
  await expect(page.getByText('Aucune participation pour ce collaborateur.',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.screenshot({path:'test-results/collaborator-detail-mobile.png'});
});

test('missing profile and collaborator details give explicit retry and return actions',async({page})=>{
  const missing='00000000-0000-0000-0000-000000000000';
  await login(page,'gestionnaire',`/profils/${missing}/presentation`);
  await expect(page.getByRole('alert')).toHaveText('Ce profil est introuvable.');
  await page.getByRole('button',{name:'Réessayer',exact:true}).click();
  await expect(page.getByRole('alert')).toHaveText('Ce profil est introuvable.');
  await page.goto(`/collaborateurs/${missing}/participations`);
  await expect(page.getByRole('alert')).toHaveText('Ce collaborateur est introuvable.');
  await expect(page.getByRole('link',{name:'Retour aux collaborateurs',exact:true})).toBeVisible();
});

test('restricted role cannot open profile or collaborator detail through a shared URL',async({page})=>{
  const id='00000000-0000-0000-0000-000000000000';
  await login(page,'intervenant',`/profils/${id}/exigences`);
  await expect(page.getByRole('heading',{name:'Accès non autorisé',exact:true})).toBeVisible();
  await page.goto(`/collaborateurs/${id}/informations`);
  await expect(page.getByRole('heading',{name:'Accès non autorisé',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Modifier',exact:true})).toHaveCount(0);
});

test('a save completed after going back does not steal focus from the list',async({page})=>{
  await login(page);
  const token=await headers(page),code='LATE-C-'+Date.now();
  const response=await page.request.post('/api/collaborateurs',{headers:token,data:{professionalId:code,firstName:'Ada',lastName:code}});
  expect(response.status()).toBe(201);const item=await response.json();
  await page.getByRole('link',{name:'Collaborateurs',exact:true}).click();
  const list=page.getByRole('region',{name:'Collaborateurs',exact:true});
  await list.getByRole('searchbox').fill(code);
  await list.getByRole('button',{name:'Rechercher les collaborateurs',exact:true}).click();
  await list.getByRole('link',{name:'Ada '+code,exact:true}).click();
  await page.getByRole('button',{name:'Modifier',exact:true}).click();
  let release!:()=>void,received!:()=>void;
  const held=new Promise<void>(resolve=>release=resolve),started=new Promise<void>(resolve=>received=resolve);
  await page.route(`**/api/collaborateurs/${item.id}`,async route=>{
    if(route.request().method()!=='PUT'){await route.continue();return;}
    const result=await route.fetch();received();await held;await route.fulfill({response:result});
  });
  await page.getByRole('dialog').getByLabel('Prénom (obligatoire)',{exact:true}).fill('Alice');
  await page.getByRole('button',{name:'Enregistrer le collaborateur',exact:true}).click();
  await started;
  await page.goBack();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await list.getByRole('searchbox').focus();
  release();
  await expect(list.getByRole('link',{name:'Alice '+code,exact:true})).toBeVisible();
  await expect(list.getByRole('searchbox')).toBeFocused();
});
