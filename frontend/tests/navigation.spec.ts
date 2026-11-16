import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('deep link, browser history and preserved catalogue filters',async({page})=>{
  await page.goto('/catalogue');
  await page.getByLabel('Identifiant',{exact:true}).fill('gestionnaire');
  await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();
  const catalogue=page.getByRole('region',{name:'Formations',exact:true});
  await expect(catalogue).toBeVisible();
  await catalogue.getByRole('searchbox').fill('Recherche conservée');
  await page.getByRole('link',{name:'Collaborateurs',exact:true}).click();
  await expect(page).toHaveURL(/\/collaborateurs$/);
  await expect(catalogue).not.toBeVisible();
  await expect(page.getByRole('region',{name:'Collaborateurs',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Créer un collaborateur',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'Créer un collaborateur',exact:true})).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(catalogue.getByRole('searchbox')).toHaveValue('Recherche conservée');
  await catalogue.getByRole('searchbox').fill('Retour utilisable');
  await page.goForward();
  await page.reload();
  await expect(page.getByRole('region',{name:'Collaborateurs',exact:true})).toBeVisible();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.screenshot({path:'test-results/navigation-desktop.png'});
  await page.setViewportSize({width:375,height:812});
  await page.getByRole('button',{name:'Navigation',exact:true}).click();
  await page.getByRole('link',{name:'Pilotage',exact:true}).click();
  await expect(page.getByRole('region',{name:'Pilotage de la formation',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Navigation',exact:true})).toHaveAttribute('aria-expanded','false');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.screenshot({path:'test-results/navigation-mobile.png'});
});

test('direct forbidden page exposes no administrative controls',async({page})=>{
  await page.goto('/acces');
  await page.getByLabel('Identifiant',{exact:true}).fill('intervenant');
  await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Accès non autorisé',exact:true})).toBeVisible();
  await expect(page.getByLabel('Rôle de sans-affectation',{exact:true})).toHaveCount(0);
  expect((await page.request.get('/api/habilitations/comptes')).status()).toBe(403);
});

test('back navigation cancels the role confirmation without changing a role',async({page})=>{
  await page.goto('/sessions');
  await page.getByLabel('Identifiant',{exact:true}).fill('admin');
  await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();
  await page.getByRole('link',{name:'Accès',exact:true}).click();
  const role=page.getByLabel('Rôle de sans-affectation',{exact:true});
  const previous=await role.inputValue();
  await page.getByRole('button',{name:'Enregistrer le rôle de sans-affectation',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('link',{name:'Accès',exact:true}).click();
  await expect(role).toHaveValue(previous);
});

test('late network error does not steal focus from the destination page',async({page})=>{
  await page.goto('/sessions');
  await page.getByLabel('Identifiant',{exact:true}).fill('gestionnaire');
  await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();
  let release!:()=>void;
  const pending=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/api/sessions/*/participants',async route=>{await pending;await route.abort();});
  await page.getByRole('button',{name:'Ouvrir les participations de Exemple — Accueil',exact:true}).click();
  await page.getByRole('link',{name:'Catalogue',exact:true}).click();
  const title=page.getByRole('heading',{name:'Formations',exact:true});
  await expect(title).toBeFocused();
  release();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(title).toBeFocused();
});
