import { test,expect,type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function login(page:Page,user:string){
  await page.goto('/');await page.getByLabel('Identifiant',{exact:true}).fill(user);await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();await page.getByRole('heading',{name:'Sessions accessibles',exact:true}).waitFor();
}
async function fixture(page:Page,count=1){
  await login(page,'admin');const csrf=await(await page.request.get('/api/auth/csrf')).json();const headers={[csrf.headerName]:csrf.token};
  const unique=`REQ-${Date.now()}`;const profileCode=`000-PROF-${9999999999999-Date.now()}`;
  async function create(path:string,data:unknown){const response=await page.request.post('/api/referentiels/'+path,{headers,data});expect(response.status()).toBe(201);return response.json();}
  const domain=await create('domaines',{code:unique,label:'Domaine exemple'});
  const subdomain=await create('sous-domaines',{domainId:domain.id,code:unique,label:'Sous-domaine exemple'});
  const competencies=[];
  for(let i=0;i<count;i++)competencies.push(await create('competences',{subdomainId:subdomain.id,code:unique+'-'+i,label:`${unique} compétence ${String(i).padStart(2,'0')}`}));
  const first=await create('classifications',{code:profileCode.replace('PROF','CL')+'-A',label:'Classification exemple A',sortOrder:0});
  const second=await create('classifications',{code:profileCode.replace('PROF','CL')+'-B',label:'Classification exemple B',sortOrder:0});
  const profile=await create('profils-emploi',{code:profileCode,label:unique+' profil'});
  await page.getByRole('button',{name:'Se déconnecter',exact:true}).click();await login(page,'gestionnaire');
  await page.getByRole('button',{name:'Profils d’emploi',exact:true}).click();
  const row=page.getByRole('row').filter({hasText:profileCode});await expect(row).toBeVisible();
  const token=await(await page.request.get('/api/auth/csrf')).json();
  return {unique,row,profile,competencies,first,second,headers:{[token.headerName]:token.token}};
}

test('manager associates and reclassifies a competency, rejects duplicate and preserves association identity',async({page})=>{
  const f=await fixture(page);const add=f.row.getByRole('button',{name:`Associer une compétence à ${f.profile.label}`,exact:true});
  await add.focus();await page.keyboard.press('Enter');const editor=page.getByRole('dialog',{name:'Associer une compétence',exact:true});
  await expect(editor.getByRole('heading')).toBeFocused();await expect(editor.getByRole('status')).toBeEmpty();
  await page.keyboard.press('Tab');await expect(editor.getByLabel('Rechercher une compétence par code ou libellé')).toBeFocused();
  await page.keyboard.press('Escape');await expect(add).toBeFocused();await add.click();
  await editor.getByLabel('Rechercher une compétence par code ou libellé').fill(f.unique);await editor.getByRole('button',{name:'Rechercher les compétences',exact:true}).click();
  await editor.getByLabel('Compétence',{exact:true}).selectOption(f.competencies[0].id);
  await editor.getByLabel('Classification',{exact:true}).selectOption(f.first.id);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.setViewportSize({width:375,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await editor.screenshot({path:'test-results/requirement-editor-mobile.png'});expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await editor.getByRole('button',{name:'Enregistrer l’exigence',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Profils d’emploi',exact:true})).toBeFocused();
  await page.setViewportSize({width:1440,height:900});
  await f.row.getByText(`Exigences de ${f.profile.label}`,{exact:true}).click();
  await expect(f.row.getByText(`${f.competencies[0].label} — ${f.first.label}`,{exact:false})).toBeVisible();
  await add.click();await editor.getByLabel('Rechercher une compétence par code ou libellé').fill(f.unique);await editor.getByRole('button',{name:'Rechercher les compétences',exact:true}).click();
  await editor.getByLabel('Compétence',{exact:true}).selectOption(f.competencies[0].id);await editor.getByLabel('Classification',{exact:true}).selectOption(f.first.id);
  await editor.getByRole('button',{name:'Enregistrer l’exigence',exact:true}).click();await expect(editor.getByRole('alert')).toContainText('déjà associée');await expect(editor.getByRole('alert')).toBeFocused();
  await page.keyboard.press('Escape');
  await f.row.getByRole('button',{name:`Reclasser l’exigence ${f.competencies[0].label}`,exact:true}).click();
  const reclass=page.getByRole('dialog',{name:'Reclasser l’exigence',exact:true});
  await expect(reclass.getByText(/Classification actuelle/)).toContainText(f.first.label);
  await reclass.getByLabel('Classification',{exact:true}).selectOption(f.second.id);await reclass.getByRole('button',{name:'Enregistrer l’exigence',exact:true}).click();
  await expect(reclass).not.toBeVisible();
  const requirements=await(await page.request.get(`/api/referentiels/profils-emploi/${f.profile.id}/exigences`)).json();
  expect(requirements).toHaveLength(1);expect(requirements[0].classificationId).toBe(f.second.id);expect(requirements[0].version).toBe(1);
  await expect(f.row.getByText(`${f.competencies[0].label} — ${f.second.label}`,{exact:false})).toBeVisible();
});

test('requirement choices paginate, recover from network failure and detect a concurrent reclassification',async({page})=>{
  const f=await fixture(page,11);await f.row.getByRole('button',{name:`Associer une compétence à ${f.profile.label}`,exact:true}).click();
  const editor=page.getByRole('dialog',{name:'Associer une compétence',exact:true});
  await editor.getByLabel('Rechercher une compétence par code ou libellé').fill(f.unique);await editor.getByRole('button',{name:'Rechercher les compétences',exact:true}).click();
  await editor.getByRole('navigation',{name:'Pages des compétences disponibles'}).getByRole('button',{name:'Choix suivants'}).click();
  await expect(editor.getByLabel('Compétence',{exact:true}).getByRole('option')).toHaveCount(2);
  await editor.getByLabel('Compétence',{exact:true}).selectOption(f.competencies[10].id);await editor.getByLabel('Classification',{exact:true}).selectOption(f.first.id);await editor.getByRole('button',{name:'Enregistrer l’exigence',exact:true}).click();
  await f.row.getByText(`Exigences de ${f.profile.label}`,{exact:true}).click();await f.row.getByRole('button',{name:`Reclasser l’exigence ${f.competencies[10].label}`,exact:true}).click();
  const reclass=page.getByRole('dialog',{name:'Reclasser l’exigence',exact:true});const path=`/api/referentiels/profils-emploi/${f.profile.id}/exigences`;
  const requirement=(await(await page.request.get(path)).json())[0];
  expect((await page.request.put(`${path}/${requirement.id}`,{headers:f.headers,data:{classificationId:f.second.id,version:0}})).status()).toBe(204);
  await reclass.getByLabel('Classification',{exact:true}).selectOption(f.first.id);await reclass.getByRole('button',{name:'Enregistrer l’exigence',exact:true}).click();
  await expect(reclass.getByRole('alert')).toContainText('modifiée');await expect(reclass.getByRole('alert')).toBeFocused();await expect(reclass.getByRole('button',{name:'Enregistrer l’exigence'})).toBeDisabled();
  await reclass.getByRole('button',{name:'Recharger les choix et l’exigence'}).click();await expect(reclass.getByText(/Classification actuelle/)).toContainText(f.second.label);
  await reclass.getByLabel('Classification',{exact:true}).selectOption(f.first.id);await reclass.getByRole('button',{name:'Enregistrer l’exigence',exact:true}).click();await expect(reclass).not.toBeVisible();
  await page.route('**/api/referentiels/profils-emploi/competences-disponibles?*',route=>route.abort());
  await f.row.getByRole('button',{name:`Associer une compétence à ${f.profile.label}`,exact:true}).click();await expect(editor.getByRole('alert')).toContainText('indisponible');
  await expect(editor.getByRole('button',{name:'Enregistrer l’exigence'})).toBeDisabled();
  await page.unroute('**/api/referentiels/profils-emploi/competences-disponibles?*');await editor.getByRole('button',{name:'Recharger les choix et l’exigence'}).click();await expect(editor.getByRole('alert')).toHaveCount(0);
  await editor.getByLabel('Rechercher une compétence par code ou libellé').fill('ABSENT-'+f.unique);await editor.getByRole('button',{name:'Rechercher les compétences',exact:true}).click();await expect(editor.getByText('Aucune compétence active pour cette recherche.')).toBeVisible();
});
