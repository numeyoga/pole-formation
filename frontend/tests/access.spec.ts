import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function login(page:Page,username:string) {
  await page.goto('/');
  await page.getByLabel('Identifiant',{exact:true}).fill(username);
  await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Sessions accessibles',exact:true})).toBeFocused();
}
test('keyboard login, scoped sessions, participants, axe and logout',async({page})=>{
  await page.goto('/');
  const username=page.getByLabel('Identifiant',{exact:true});
  await expect(username).toBeVisible();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.keyboard.press('Tab');
  await expect(username).toBeFocused();
  await page.keyboard.type('intervenant');await page.keyboard.press('Tab');
  await expect(page.getByLabel('Mot de passe',{exact:true})).toBeFocused();
  await page.keyboard.type('Dev-only-2026!');await page.keyboard.press('Tab');
  await expect(page.getByRole('button',{name:'Se connecter',exact:true})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading',{name:'Sessions accessibles',exact:true})).toBeFocused();
  await expect(page.getByRole('button',{name:'Exemple — Prévention',exact:true})).toHaveCount(0);
  await expect(page.getByRole('heading',{name:'Habilitations',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Exemple — Accueil',exact:true}).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading',{name:'Participants — Exemple — Accueil',exact:true})).toBeFocused();
  await expect(page.getByText(/Camille Exemple · EXEMPLE-001/)).toBeVisible();
  await page.getByRole('button',{name:'Marquer Camille Exemple présente',exact:true}).click();
  await expect(page.getByRole('status')).toHaveText('Modification enregistrée.');
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  const cookies=await page.context().cookies();
  expect(cookies.find(cookie=>cookie.name==='JSESSIONID')?.httpOnly).toBe(true);
  expect(await page.evaluate(()=>Object.keys(localStorage))).toEqual([]);
  await page.getByRole('button',{name:'Se déconnecter',exact:true}).click();
  await expect(username).toBeFocused();
  expect((await page.request.get('/api/auth/me')).status()).toBe(401);
});
test('invalid login announces the error and focuses it',async({page})=>{
  await page.goto('/');await page.getByLabel('Identifiant',{exact:true}).fill('intervenant');
  await page.getByLabel('Mot de passe',{exact:true}).fill('incorrect');
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();
  await expect(page.getByRole('alert')).toHaveText('Identifiant ou mot de passe incorrect.');
  await expect(page.getByRole('alert')).toBeFocused();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});
test('administrator can review and confirm roles, dialog supports Escape and restores focus',async({page})=>{
  await login(page,'admin');
  await page.getByLabel('Rôle de sans-affectation',{exact:true}).selectOption('GESTIONNAIRE');
  const save=page.getByRole('button',{name:'Enregistrer le rôle de sans-affectation',exact:true});
  await save.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button',{name:'Annuler',exact:true})).toBeFocused();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');await expect(save).toBeFocused();
  await save.click();await page.getByRole('button',{name:'Confirmer',exact:true}).click();
  await expect(page.getByRole('status')).toHaveText('Modification enregistrée.');
  await expect(page.getByLabel('Rôle de sans-affectation',{exact:true})).toHaveValue('GESTIONNAIRE');
  await expect(page.getByRole('heading',{name:'Habilitations',exact:true})).toBeFocused();
  // Restore the fictional account for subsequent runs.
  await page.getByLabel('Rôle de sans-affectation',{exact:true}).selectOption('INTERVENANT');
  await save.click();await page.getByRole('button',{name:'Confirmer',exact:true}).click();
  await expect(page.getByRole('status')).toHaveText('Modification enregistrée.');
  await expect(page.getByLabel('Rôle de sans-affectation',{exact:true})).toHaveValue('INTERVENANT');
});
test('empty state, reload, expired session and narrow viewport',async({page})=>{
  await page.setViewportSize({width:375,height:812});await login(page,'sans-affectation');
  await expect(page.getByText('Aucune session accessible pour ce compte.',{exact:true})).toBeVisible();
  await page.reload();await expect(page.getByText('Aucune session accessible pour ce compte.',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.context().clearCookies();await page.reload();
  await expect(page.getByLabel('Identifiant',{exact:true})).toBeVisible();
});
