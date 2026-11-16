export interface AppPage {
  id: string;
  path: string;
  label: string;
  group: string;
  description: string;
  permission?: string;
  entityId?: string;
  section?: string;
}

export const referenceItems:AppPage[] = [
  {id:'domaines',path:'/referentiel/domaines',label:'Domaines',group:'Référentiel',description:'Structurez les grands domaines du référentiel.',permission:'WRITE_REFERENTIAL'},
  {id:'sous-domaines',path:'/referentiel/sous-domaines',label:'Sous-domaines',group:'Référentiel',description:'Organisez les sous-domaines et leurs rattachements.',permission:'WRITE_REFERENTIAL'},
  {id:'competences',path:'/referentiel/competences',label:'Compétences',group:'Référentiel',description:'Administrez les compétences du référentiel.',permission:'WRITE_REFERENTIAL'},
  {id:'explorateur',path:'/referentiel/explorateur',label:'Explorer le référentiel',group:'Référentiel',description:'Parcourez les domaines, sous-domaines et compétences.',permission:'WRITE_REFERENTIAL'},
];
export const navigationItems:AppPage[] = [
  {id:'sessions',path:'/sessions',label:'Sessions',group:'Activité',description:'Retrouvez les sessions et suivez les participations.'},
  {id:'collaborateurs',path:'/collaborateurs',label:'Collaborateurs',group:'Activité',description:'Gérez les collaborateurs et consultez leurs participations.',permission:'MANAGE_SESSION'},
  {id:'intervenants',path:'/intervenants',label:'Intervenants',group:'Activité',description:'Retrouvez les intervenants et leurs coordonnées.',permission:'MANAGE_SESSION'},
  {id:'pilotage',path:'/pilotage',label:'Pilotage',group:'Activité',description:'Consultez les indicateurs de l’activité formation.',permission:'READ_REPORTING'},
  {id:'catalogue',path:'/catalogue',label:'Catalogue',group:'Ressources',description:'Gérez les formations, leurs correspondances et leurs sessions.',permission:'WRITE_REFERENTIAL'},
  {id:'profils',path:'/profils',label:'Profils d’emploi',group:'Ressources',description:'Définissez les profils et leurs exigences de compétences.',permission:'WRITE_REFERENTIAL'},
  {...referenceItems[0],group:'Ressources'},
  {id:'classifications',path:'/parametres/classifications',label:'Paramètres',group:'Administration',description:'Configurez les classifications des exigences.',permission:'WRITE_CLASSIFICATION'},
  {id:'acces',path:'/acces',label:'Accès',group:'Administration',description:'Administrez les rôles des comptes de l’application.',permission:'WRITE_ROLES'},
  {id:'journal',path:'/journal',label:'Journal',group:'Administration',description:'Consultez l’historique des opérations.',permission:'READ_AUDIT'},
];
const pages=[...navigationItems.filter(page=>page.id!=='domaines'),...referenceItems];

// TypeScript's DOM library does not yet declare URLPattern. Keep its boundary local.
type PatternConstructor=new (input:{pathname:string})=>{test(input:{pathname:string}):boolean};
export function resolvePage(location:Pick<Location,'pathname'>):AppPage|null {
  const pathname=location.pathname==='/'?'/sessions':location.pathname;
  const detail=/^\/(catalogue|profils|collaborateurs)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/([^/]+))?$/i.exec(pathname);
  if(detail){
    const [,id,entityId,requestedSection]=detail;
    const sections:Record<string,string[]>={catalogue:['presentation','competences','sessions'],profils:['presentation','exigences','formations'],collaborateurs:['informations','participations']};
    const labels:Record<string,string>={catalogue:'Formation',profils:'Profil d’emploi',collaborateurs:'Collaborateur'};
    const section=requestedSection??sections[id]?.[0];
    const parent=pages.find(page=>page.id===id);
    return parent&&sections[id].includes(section)?{...parent,path:pathname,label:labels[id],entityId,section}:null;
  }
  const Pattern=(globalThis as typeof globalThis & {URLPattern?:PatternConstructor}).URLPattern;
  return pages.find(page=>Pattern?new Pattern({pathname:page.path}).test({pathname}):page.path===pathname)??null;
}
export function canOpenPage(page:AppPage, permissions:readonly string[]):boolean {
  return !page.permission||permissions.includes(page.permission);
}
const navigationEvent='app-navigation';
export function navigate(event:MouseEvent):void {
  const link=event.currentTarget as HTMLAnchorElement;
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target||link.hasAttribute('download'))return;
  const url=new URL(link.href);
  if(url.origin!==window.location.origin)return;
  event.preventDefault();
  if(url.href!==window.location.href)window.history.pushState(null,'',url);
  window.dispatchEvent(new Event(navigationEvent));
}
export function subscribeNavigation(listener:()=>void):()=>void {
  window.addEventListener('popstate',listener);
  window.addEventListener(navigationEvent,listener);
  return ()=>{window.removeEventListener('popstate',listener);window.removeEventListener(navigationEvent,listener);};
}
