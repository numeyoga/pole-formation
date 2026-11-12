import { test,expect,type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function fixture(page:Page,count=1,requirementCount=2,coveredCount=requirementCount,user='gestionnaire'){
  await page.goto('/');await page.getByLabel('Identifiant',{exact:true}).fill(user);
  await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();
  await page.getByRole('heading',{name:'Sessions accessibles',exact:true}).waitFor();
  const csrf=await(await page.request.get('/api/auth/csrf')).json();const headers={[csrf.headerName]:csrf.token};
  const tag=`MATCH-${Date.now()}`;const code=`000-000MATCH-${9999999999999-Date.now()}`;
  async function create(path:string,data:unknown){const response=await page.request.post(path,{headers,data});expect(response.status()).toBe(201);return response.json();}
  const domain=await create('/api/referentiels/domaines',{code:tag,label:'Domaine correspondances'});
  const sub=await create('/api/referentiels/sous-domaines',{domainId:domain.id,code:tag,label:'Sous-domaine correspondances'});
  const competencies=[];
  for(let i=0;i<requirementCount;i++)competencies.push(await create('/api/referentiels/competences',{subdomainId:sub.id,code:`${tag}-${i}`,label:`Compétence ${i}`}));
  const profile=await create('/api/referentiels/profils-emploi',{code,label:`Profil ${tag}`});
  for(const competency of competencies)await create(`/api/referentiels/profils-emploi/${profile.id}/exigences`,{competencyId:competency.id,classificationId:'60000000-0000-0000-0000-000000000001'});
  const formations=[];
  for(let i=0;i<count;i++){
    const formation=await create('/api/formations',{code:`${tag}-${String(i).padStart(2,'0')}`,title:`Formation pertinente ${i}`});
    expect((await page.request.post(`/api/formations/${formation.id}/activation`,{headers,data:{version:0}})).status()).toBe(204);
    for(const competency of competencies.slice(0,coveredCount))await create(`/api/formations/${formation.id}/competences`,{competencyId:competency.id});
    formations.push(formation);
  }
  await page.getByRole('button',{name:'Profils d’emploi',exact:true}).click();
  await page.getByRole('button',{name:'Actualiser les profils',exact:true}).click();
  const row=page.getByRole('row').filter({hasText:code});await expect(row).toBeVisible();
  const matches=row.locator('profile-formations');const summary=matches.locator('summary').filter({hasText:/^Formations pertinentes pour /});
  return {tag,headers,profile,formations,row,matches,summary,create,competencies};
}

test('profile selection returns unique matching active formations, including sessionless offers, and explicit empty state',async({page})=>{
  const f=await fixture(page);
  await f.summary.focus();await page.keyboard.press('Enter');
  await expect(f.matches.getByRole('status')).toHaveText('1 formation(s) pertinente(s).');
  await expect(f.matches.getByRole('listitem')).toHaveCount(1);
  await expect(f.matches.getByRole('listitem')).toContainText(f.formations[0].code);
  await expect(f.matches.getByText('Aucune session planifiée',{exact:true})).toBeVisible();
  await expect(f.summary).toBeFocused();
  await page.keyboard.press('Tab');await expect(f.matches.getByRole('button',{name:'Actualiser les correspondances',exact:true})).toBeFocused();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.setViewportSize({width:375,height:812});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await f.matches.screenshot({path:'test-results/profile-formations-mobile.png'});
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  expect((await page.request.post(`/api/formations/${f.formations[0].id}/archivage`,{headers:f.headers,data:{version:1}})).status()).toBe(204);
  await f.matches.getByRole('button',{name:'Actualiser les correspondances',exact:true}).click();
  await expect(f.matches.getByText('Aucune formation active ne correspond aux compétences de ce profil.',{exact:true})).toBeVisible();
  await expect(f.matches.getByRole('list')).toHaveCount(0);
  await expect(f.matches.getByRole('status')).toHaveText('0 formation(s) pertinente(s).');
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});

test('profile match pagination, errors, retry and stale responses keep the selected profile consistent',async({page})=>{
  const f=await fixture(page,11);await f.summary.click();
  await expect(f.matches.getByRole('listitem')).toHaveCount(10);
  await f.matches.getByRole('button',{name:'Correspondances suivantes',exact:true}).focus();await page.keyboard.press('Enter');
  await expect(f.matches.getByText('Page 2',{exact:true})).toBeVisible();
  await expect(f.matches.getByRole('listitem')).toHaveCount(1);
  await expect(f.matches.getByRole('listitem')).toContainText(`${f.tag}-10`);
  await expect(f.matches.getByRole('heading',{name:'Formations pertinentes',exact:true})).toBeFocused();
  const pattern=`**/api/referentiels/profils-emploi/${f.profile.id}/formations?*`;
  await page.route(pattern,route=>route.abort());
  await f.matches.getByRole('button',{name:'Actualiser les correspondances',exact:true}).click();
  await expect(f.matches.getByRole('alert')).toContainText('indisponible');
  await expect(f.matches.getByRole('list')).toHaveCount(0);
  await page.unroute(pattern);await f.matches.getByRole('button',{name:'Réessayer la recherche des correspondances',exact:true}).click();
  await expect(f.matches.getByText('Page 2',{exact:true})).toBeVisible();
  await expect(f.matches.getByRole('listitem')).toHaveCount(1);
  // A response arriving after the disclosure closes must not repopulate it.
  let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
  await page.route(pattern,async route=>{await gate;await route.fulfill({json:{items:[],page:0,size:10,total:0}});});
  await f.matches.getByRole('button',{name:'Actualiser les correspondances',exact:true}).click();
  await expect(f.matches.getByRole('progressbar')).toBeVisible();await f.summary.click();
  await expect(f.matches.locator('progress')).toHaveCount(0);
  const delivered=page.waitForResponse(response=>response.url().includes(`/profils-emploi/${f.profile.id}/formations`));
  release();await delivered;await page.unroute(pattern);await f.summary.click();
  await expect(f.matches.getByRole('listitem')).toHaveCount(10);
  await expect(f.matches.getByRole('status')).toHaveText('11 formation(s) pertinente(s).');
  await f.matches.getByRole('button',{name:'Correspondances suivantes',exact:true}).click();
  expect((await page.request.post(`/api/formations/${f.formations[10].id}/archivage`,{headers:f.headers,data:{version:1}})).status()).toBe(204);
  await f.matches.getByRole('button',{name:'Actualiser les correspondances',exact:true}).click();
  await expect(f.matches.getByRole('listitem')).toHaveCount(10);await expect(f.matches.getByText('Page 2',{exact:true})).toHaveCount(0);
});


test('common competencies show the classifications from the selected profile and uncover only unmet needs',async({page})=>{
  const f=await fixture(page,1,3,2,'admin');
  const classification=await f.create('/api/referentiels/classifications',{code:`${f.tag}-CLASS`,label:'Classification spécifique du profil',sortOrder:1});
  const root=`/api/referentiels/profils-emploi/${f.profile.id}`;
  const requirements=await(await page.request.get(root+'/exigences')).json();
  const requirement=requirements.find((item:{competencyId:string})=>item.competencyId===f.competencies[1].id);
  expect((await page.request.put(root+`/exigences/${requirement.id}`,{headers:f.headers,data:{classificationId:classification.id,version:requirement.version}})).status()).toBe(204);
  await f.summary.focus();await page.keyboard.press('Enter');
  const common=f.matches.locator('match-requirements').filter({has:page.locator('summary').filter({hasText:'Compétences communes avec'})});
  const needs=f.matches.locator('match-requirements').filter({has:page.getByText('Besoins non couverts',{exact:true})});
  await common.locator('summary').focus();await page.keyboard.press('Enter');
  await expect(common.getByRole('listitem')).toHaveCount(2);await expect(common.getByRole('listitem').nth(0)).toContainText(f.competencies[0].code);
  await expect(common.getByRole('listitem').nth(1)).toContainText('Classification spécifique du profil');
  await expect(common.getByRole('status')).toHaveText('2 compétence(s).');await expect(common.locator('summary')).toBeFocused();
  await needs.locator('summary').focus();await page.keyboard.press('Space');
  await expect(needs.getByRole('listitem')).toHaveCount(1);await expect(needs.getByRole('listitem')).toContainText(f.competencies[2].code);
  await expect(common.getByRole('listitem')).toHaveCount(2); // Both disclosures stay open.
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.setViewportSize({width:375,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await needs.screenshot({path:'test-results/profile-uncovered-mobile.png'});
  expect((await page.request.post(`/api/formations/${f.formations[0].id}/archivage`,{headers:f.headers,data:{version:1}})).status()).toBe(204);
  await common.getByRole('button',{name:'Actualiser les compétences affichées',exact:true}).click();
  await expect(common.getByRole('alert')).toBeVisible();await expect(common.getByRole('list')).toHaveCount(0);
  await needs.getByRole('button',{name:'Actualiser les compétences affichées',exact:true}).click();await expect(needs.getByRole('listitem')).toHaveCount(3);
});

test('explanation and uncovered pages paginate, retry failures, refresh coverage and handle fully covered profiles',async({page})=>{
  const f=await fixture(page,1,12,12);await f.summary.click();
  const common=f.matches.locator('match-requirements').filter({has:page.locator('summary').filter({hasText:'Compétences communes avec'})});
  const needs=f.matches.locator('match-requirements').filter({has:page.getByText('Besoins non couverts',{exact:true})});
  await common.locator('summary').click();await expect(common.getByRole('listitem')).toHaveCount(10);
  await common.getByRole('button',{name:'Compétences suivantes',exact:true}).focus();await page.keyboard.press('Enter');
  await expect(common.getByText('Page 2',{exact:true})).toBeVisible();await expect(common.getByRole('listitem')).toHaveCount(2);
  await expect(common.getByRole('heading',{name:'Compétences communes',exact:true})).toBeFocused();
  const pattern=`**/api/referentiels/profils-emploi/${f.profile.id}/formations/*/correspondance?*`;
  await page.route(pattern,route=>route.abort());await common.getByRole('button',{name:'Actualiser les compétences affichées',exact:true}).click();
  await expect(common.getByRole('alert')).toContainText('indisponible');await expect(common.getByRole('list')).toHaveCount(0);
  await page.unroute(pattern);await common.getByRole('button',{name:'Réessayer le chargement des compétences',exact:true}).click();
  await expect(common.getByText('Page 2',{exact:true})).toBeVisible();await expect(common.getByRole('listitem')).toHaveCount(2);
  await needs.locator('summary').click();await expect(needs.getByRole('status')).toHaveText('0 compétence(s).');
  await expect(needs.getByText('Toutes les compétences de ce profil sont couvertes par au moins une formation active, ou le profil ne comporte aucune exigence.',{exact:true})).toBeVisible();
  expect((await page.request.post(`/api/formations/${f.formations[0].id}/archivage`,{headers:f.headers,data:{version:1}})).status()).toBe(204);
  await needs.getByRole('button',{name:'Actualiser les compétences affichées',exact:true}).click();await expect(needs.getByRole('listitem')).toHaveCount(10);
  await needs.getByRole('button',{name:'Compétences suivantes',exact:true}).click();await expect(needs.getByRole('listitem')).toHaveCount(2);
  await expect(needs.getByRole('heading',{name:'Besoins non couverts',exact:true})).toBeFocused();
  const partial=await f.create('/api/formations',{code:`${f.tag}-PARTIAL`,title:'Couverture partielle'});
  expect((await page.request.post(`/api/formations/${partial.id}/activation`,{headers:f.headers,data:{version:0}})).status()).toBe(204);
  for(const competency of f.competencies.slice(0,2))await f.create(`/api/formations/${partial.id}/competences`,{competencyId:competency.id});
  await needs.getByRole('button',{name:'Actualiser les compétences affichées',exact:true}).click();
  await expect(needs.getByRole('listitem')).toHaveCount(10);await expect(needs.getByText('Page 2',{exact:true})).toHaveCount(0);
  expect((await page.request.post(`/api/formations/${f.formations[0].id}/reactivation`,{headers:f.headers,data:{version:2}})).status()).toBe(204);
  await needs.getByRole('button',{name:'Actualiser les compétences affichées',exact:true}).click();
  await expect(needs.getByRole('status')).toHaveText('0 compétence(s).');await expect(needs.getByRole('list')).toHaveCount(0);
});
