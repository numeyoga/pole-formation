import {expect,type Page} from '@playwright/test';

/** Find a fixture through the public pagination, including after a form resets the list. */
export async function revealProfile(page:Page,code:string){
 const panel=page.getByRole('region',{name:'Profils d’emploi',exact:true});
 const row=panel.getByRole('row').filter({has:page.getByRole('cell',{name:code,exact:true})});
 const status=panel.getByRole('status',{name:'État des profils',exact:true});
 await expect(status).not.toHaveText('Chargement des profils…');
 if(await row.count())return row;
 const previous=panel.getByRole('button',{name:'Profils précédents',exact:true});
 const next=panel.getByRole('button',{name:'Profils suivants',exact:true});
 async function turn(button:typeof next){
  await Promise.all([page.waitForResponse(response=>response.request().method()==='GET'&&new URL(response.url()).pathname==='/api/referentiels/profils-emploi'),button.click()]);
  await expect(status).not.toHaveText('Chargement des profils…');
 }
 while(await previous.count()&&await previous.isEnabled())await turn(previous);
 while(!await row.count()){
  await expect(next).toBeEnabled();await turn(next);
 }
 await expect(row).toBeVisible();return row;
}
