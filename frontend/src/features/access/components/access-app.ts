import {navigationItems, referenceItems, resolvePage, canOpenPage, navigate, subscribeNavigation} from '../../../app/navigation';
import {dismissDialogs} from '../../../app/dismiss-dialogs';
import type {AppPage} from '../../../app/navigation';
import '../../reporting/components/reporting-panel';
import '../../participations/components/session-enrollment';
import '../../collaborators/components/collaborators-panel';
import '../../instructors/components/instructors-panel';
import '../../formations/components/formations-panel';
import '../../classifications/components/classifications-panel';
import '../../profiles/components/profiles-panel';
import { LitElement, css, html, nothing } from 'lit';
import { api, ApiError } from '../adapters/access-api';
import type { Identity, SessionView, ParticipantView, AccountView, Role } from '../presentation/models';
import { messages as m, roles, states } from '../../../shared/i18n/fr';
import '../../audit/components/audit-log';
import '../../domains/components/domains-panel';
import '../../subdomains/components/subdomains-panel';
import '../../competencies/components/competencies-panel';
import '../../explorer/components/reference-explorer';

export class AccessApp extends LitElement {
  static properties = {
    identity:{state:true}, sessions:{state:true}, selected:{state:true}, participants:{state:true}, accounts:{state:true},
    busy:{state:true}, error:{state:true}, notice:{state:true}, initialized:{state:true},
    auditRevision:{state:true}, page:{state:true}, navigationOpen:{state:true}, sessionQuery:{state:true}, sessionState:{state:true},
  };
  declare identity: Identity|null;
  declare sessions: SessionView[];
  declare selected: SessionView|null;
  declare participants: ParticipantView[];
  declare accounts: AccountView[];
  declare busy:boolean;
  declare error:string;
  declare notice:string;
  declare initialized:boolean;
  declare auditRevision:number;
  declare page:AppPage|null;
  declare navigationOpen:boolean;
  declare sessionQuery:string;
  declare sessionState:string;
  private visitedPages=new Set<string>();
  private lastSessionId='';
  private unsubscribeNavigation?:()=>void;
  private navigationRevision=0;
  constructor() {
    super(); this.identity=null;this.sessions=[];this.selected=null;this.participants=[];this.accounts=[];
    this.busy=false;this.error='';this.notice='';this.initialized=false;this.auditRevision=0;this.page=resolvePage(window.location);this.navigationOpen=false;this.sessionQuery='';this.sessionState='';
    if(this.page)this.visitedPages.add(this.page.id);
  }
  static styles = css`
    :host { display:block; }
    * { box-sizing:border-box; }
    header,section,form,ul { display:grid; gap:var(--space-normal); }
    header { padding-block-end:var(--space-section); border-block-end:var(--border-width) solid var(--color-border); }
    section { margin-block-start:var(--space-section); padding:var(--space-section); background:var(--color-surface); border:var(--border-width) solid var(--color-border); border-radius:var(--control-radius); }
    h1 { font-size:var(--text-heading); margin:0; }
    h2 { font-size:var(--text-section); margin:0; }
    p { margin:0; }
    label { display:grid; gap:var(--space-small); }
    input,select,button { font:inherit; min-block-size:var(--control-height); padding:var(--space-control); border:var(--border-width) solid var(--color-border); border-radius:var(--control-radius); }
    input,select { inline-size:100%; max-inline-size:var(--control-width); color:var(--color-text); background:var(--color-surface); }
    button { color:var(--color-primary); background:var(--color-surface); cursor:pointer; inline-size:fit-content; max-inline-size:100%; }
    button:where(:enabled):hover { color:var(--color-hover); text-decoration:underline; }
    button[data-primary] { color:var(--color-surface); background:var(--color-primary); }
    button[data-primary]:where(:enabled):hover { background:var(--color-hover); }
    :focus-visible { outline:var(--focus-width) solid var(--color-focus); outline-offset:var(--focus-width); }
    button:disabled { opacity:var(--disabled-opacity); cursor:wait; }
    [role=alert] { color:var(--color-danger); padding-block:var(--space-normal); }
    [role=status] { color:var(--color-success); padding-block:var(--space-normal); }
    ul { padding-inline-start:var(--space-section); }
    li { padding-block:var(--space-small); overflow-wrap:anywhere; }
    [hidden] { display:none; }
    .actions { display:flex; flex-wrap:wrap; gap:var(--space-small); margin-block-start:var(--space-small); }
    .muted { color:var(--color-muted); }
    dialog { max-inline-size:var(--control-width); padding:var(--space-section); color:var(--color-text); background:var(--color-surface); border:var(--border-width) solid var(--color-border); border-radius:var(--control-radius); }

    .app-shell { display:grid; grid-template-columns:minmax(0,1fr); block-size:100dvh; overflow:hidden; }
    .app-shell[data-authenticated] { grid-template-columns:var(--shell-navigation-width) minmax(0,1fr); }
    .workspace { display:grid; grid-template-rows:auto minmax(0,1fr); min-inline-size:0; min-block-size:0; }
    .sidebar { display:flex; flex-direction:column; gap:var(--space-page); padding:var(--space-section) var(--space-normal); background:var(--color-navigation); color:var(--color-on-navigation); overflow:auto; }
    .brand { display:flex; align-items:center; gap:var(--space-control); padding:var(--space-small); font-size:var(--text-section); font-weight:var(--font-weight-strong); color:inherit; text-decoration:none; }
    .brand__mark { display:grid; place-items:center; inline-size:var(--control-height); block-size:var(--control-height); border-radius:var(--control-radius); background:var(--color-navigation-active); font-size:var(--text-base); }
    small { display:block; font-size:var(--text-base); font-weight:var(--font-weight-normal); }
    .brand small,.sidebar__footer { color:var(--color-navigation-muted); }
    .sidebar nav { display:grid; gap:var(--space-section); }
    .navigation-group__title { padding-inline:var(--space-control); color:var(--color-navigation-muted); font-size:var(--text-small); text-transform:uppercase; font-weight:var(--font-weight-strong); letter-spacing:var(--tracking-label); }
    .sidebar ul { list-style:none; padding:0; gap:var(--space-small); margin-block:var(--space-small) 0; }
    .sidebar li { padding:0; }
    .sidebar nav a { display:flex; align-items:center; min-block-size:var(--control-height); padding:var(--space-small) var(--space-control); border-radius:var(--control-radius); color:var(--color-on-navigation); text-decoration:none; border-inline-start:var(--focus-width) solid transparent; }
    .sidebar nav a:hover { background:var(--color-navigation-hover); }
    .sidebar nav a[aria-current] { background:var(--color-navigation-active); border-inline-start-color:var(--color-navigation-accent); font-weight:var(--font-weight-strong); }
    .sidebar :focus-visible { outline-color:var(--color-on-navigation); }
    .sidebar__footer { margin-block-start:auto; padding:var(--space-control); font-size:var(--text-small); }
    .topbar { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:var(--space-normal); padding:var(--space-normal) var(--space-page); background:var(--color-surface); min-block-size:var(--shell-topbar-height); }
    .topbar>p { font-weight:var(--font-weight-strong); }
    .topbar__identity { display:flex; align-items:center; gap:var(--space-section); }
    .topbar__identity small { color:var(--color-muted); }
    .page { padding:var(--space-page); min-inline-size:0; overflow:auto; }
    .page-header { display:grid; gap:var(--space-small); margin-block-end:var(--space-section); }
    .page-header>p:first-child { font-size:var(--text-small); font-weight:var(--font-weight-strong); }
    .page>p[role=status]:empty { padding:0; }
    .page>section:first-of-type { margin-block-start:var(--space-normal); }
    .reference-navigation { display:flex; flex-wrap:wrap; gap:var(--space-small); padding-block:var(--space-normal); border-block-end:var(--border-width) solid var(--color-border); }
    .reference-navigation a { display:flex; align-items:center; min-block-size:var(--control-height); padding:var(--space-control); color:var(--color-primary); border-radius:var(--control-radius); }
    .reference-navigation a[aria-current] { background:var(--color-primary); color:var(--color-surface); text-decoration:none; }
    .sessions-filters { display:flex; align-items:end; flex-wrap:wrap; gap:var(--space-normal); }
    .sessions-filters label:first-child { flex:1; min-inline-size:min(100%,var(--control-width)); }
    .sessions-filters input { max-inline-size:none; }
    .table-container { overflow:auto; max-inline-size:100%; }
    table { inline-size:100%; border-collapse:collapse; }
    caption { text-align:start; color:var(--color-muted); padding-block:var(--space-small); }
    th,td { text-align:start; vertical-align:top; padding:var(--space-control); border-block-end:var(--border-width) solid var(--color-border); overflow-wrap:anywhere; }
    th { font-weight:var(--font-weight-strong); }
    .session-state { display:inline-block; padding:var(--space-small); background:var(--color-background); border:var(--border-width) solid var(--color-border); border-radius:var(--control-radius); white-space:nowrap; }
    .participants-header { display:grid; gap:var(--space-small); }
    .skip-link { position:absolute; inset-block-start:var(--space-small); inset-inline-start:var(--space-small); padding:var(--space-normal); background:var(--color-surface); color:var(--color-primary); transform:translateY(calc(-100% - var(--space-page))); z-index:var(--layer-skip-link); }
    .skip-link:focus { transform:none; }
    .navigation-toggle { display:none; }
    @media(max-width:767px) {
      .app-shell[data-authenticated] { grid-template-columns:minmax(0,1fr); grid-template-rows:auto minmax(0,1fr); }
      .sidebar { gap:var(--space-normal); padding:var(--space-normal); max-block-size:var(--shell-mobile-navigation-height); }
      .sidebar nav:not([data-open]),.sidebar__footer { display:none; }
      .sidebar nav { grid-template-columns:repeat(auto-fit,minmax(var(--shell-mobile-group-width),1fr)); }
      .navigation-toggle { display:block; }
      .topbar,.page { padding:var(--space-normal); }
      .topbar__identity { flex-wrap:wrap; gap:var(--space-small); }
    }
  `;
  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeNavigation=subscribeNavigation(()=>{
      this.navigationRevision++;
      dismissDialogs(this.renderRoot);
      this.page=resolvePage(window.location);this.navigationOpen=false;this.notice='';this.error='';
      if(this.page)this.visitedPages.add(this.page.id);
      this.updateDocumentTitle();void this.focusCurrentPage();
    });
    this.updateDocumentTitle();void this.restore();
  }
  disconnectedCallback() { super.disconnectedCallback();this.unsubscribeNavigation?.(); }
  private isVisited(id:string) {
    const page=[...navigationItems,...referenceItems].find(item=>item.id===id);
    return Boolean(page&&this.identity&&canOpenPage(page,this.identity.permissions)&&this.visitedPages.has(id));
  }
  private async focusCurrentPage() {
    const id=this.page?.id;const path=this.page?.path;
    await this.updateComplete;
    if(this.page?.path!==path)return;
    const component=this.renderRoot.querySelector(`[data-page="${id}"]`)?.firstElementChild as (HTMLElement & {focusHeading?:()=>Promise<void>})|null;
    if(component?.focusHeading)await component.focusHeading();
    else await this.focusElement('#page-title');
  }
  private updateDocumentTitle() { document.title=`${this.page?.label??'Page introuvable'} — Pôle formation`; }
  private followLink(event:MouseEvent) { navigate(event); }
  private toggleNavigation() {
    this.navigationOpen=!this.navigationOpen;
    if(this.navigationOpen)void this.focusElement('#primary-navigation a');
  }
  private renderLink(page:AppPage) {
    const active=this.page?.id===page.id||(page.id==='domaines'&&this.page?.group==='Référentiel');
    return html`<a href=${page.path} aria-current=${active?'page':nothing} @click=${this.followLink}>${page.id==='domaines'?'Référentiel':page.label}</a>`;
  }

  private async focusElement(selector:string) { await this.updateComplete; this.renderRoot.querySelector<HTMLElement>(selector)?.focus(); }
  private async run(work:()=>Promise<void>) {
    if(this.busy)return;
    const navigationRevision=this.navigationRevision;
    this.busy=true;this.error='';this.notice='';
    try { await work(); } catch(error) {
      this.error=error instanceof Error?error.message:m.network;
      if(error instanceof ApiError && error.status===401 && this.identity) this.clearIdentity();
      if(navigationRevision===this.navigationRevision)void this.focusElement('[role=alert]');
    } finally { this.busy=false; }
  }
  private clearIdentity() { this.identity=null;this.sessions=[];this.accounts=[];this.selected=null;this.participants=[];this.visitedPages.clear();this.sessionQuery='';this.sessionState=''; }
  private async refresh() {
    this.identity=await api.me();if(this.page)this.visitedPages.add(this.page.id);this.sessions=await api.sessions();
    this.accounts=this.identity.permissions.includes('WRITE_ROLES')?await api.accounts():[];
    this.auditRevision++;
  }
  private async restore() {
    await this.run(async()=>{
      try { await this.refresh(); } catch(error) {
        if(error instanceof ApiError && error.status===401) this.clearIdentity();else throw error;
      } finally { this.initialized=true; }
    });
  }
  private async login(event:SubmitEvent) {
    event.preventDefault();const form=event.currentTarget as HTMLFormElement;const data=new FormData(form);
    await this.run(async()=>{ await api.login(String(data.get('username')),String(data.get('password')));form.reset();await this.refresh();void this.focusElement('#page-title'); });
  }
  private async logout() {
    await this.run(async()=>{await api.logout();this.clearIdentity();void this.focusElement('#username');});
  }
  private async select(session:SessionView) {
    this.lastSessionId=session.id;
    await this.run(async()=>{this.selected=null;this.participants=[];const participants=await api.participants(session.id);this.selected=session;this.participants=participants;void this.focusElement('#participants-title');});
  }
  private async returnToSessions() {
    this.selected=null;this.participants=[];
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLButtonElement>(`[data-session-id="${CSS.escape(this.lastSessionId)}"]`)?.focus();
  }
  private get visibleSessions() {
    const query=this.sessionQuery.trim().toLocaleLowerCase('fr');
    return this.sessions.filter(session=>(!this.sessionState||session.state===this.sessionState)&&
      (!query||`${session.title} ${states[session.state]??session.state}`.toLocaleLowerCase('fr').includes(query)));
  }
  private async presence(participant:ParticipantView,state:'PRESENTE'|'ABSENTE') {
    if(!this.selected)return;const session=this.selected;
    await this.run(async()=>{await api.presence(session.id,participant.id,state);this.participants=await api.participants(session.id);this.notice=m.saved;this.auditRevision++;});
  }
  private async changeRole(event:SubmitEvent,account:AccountView) {
    event.preventDefault();const form=event.currentTarget as HTMLFormElement;const data=new FormData(form);const role=String(data.get('role')) as Role;
    this.notice='';
    const dialog=this.renderRoot.querySelector<HTMLDialogElement>('#confirm-role')!;
    const description=this.renderRoot.querySelector<HTMLElement>('#confirm-description')!;
    description.textContent=`${account.username} : ${roles[account.role]} → ${roles[role]}`;
    dialog.returnValue='';dialog.showModal();
    const confirmed=await new Promise<boolean>(resolve=>dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true}));
    if(!confirmed)return;
    await this.run(async()=>{await api.role(account.username,role);await this.refresh();this.notice=m.saved;void this.focusElement('#accounts-title');});
  }
  render() {
    return html`
      <nav aria-label="Accès rapide"><button class="skip-link" type="button" @click=${()=>this.focusElement('#page-title')}>Aller au contenu</button></nav>
      <div class="app-shell" ?data-authenticated=${Boolean(this.identity)}>
      ${this.identity?html`<aside class="sidebar">
        <a class="brand" href="/sessions" @click=${this.followLink}><span class="brand__mark" aria-hidden="true">PF</span><span>Pôle formation<small>INT · Espace de gestion</small></span></a>
        <nav id="primary-navigation" aria-label="Navigation principale" ?data-open=${this.navigationOpen}>
          ${['Activité','Ressources','Administration'].map(group=>{
            const items=navigationItems.filter(page=>page.group===group&&canOpenPage(page,this.identity!.permissions));
            return items.length?html`<div class="navigation-group"><p class="navigation-group__title">${group}</p><ul>${items.map(page=>html`<li>${this.renderLink(page)}</li>`)}</ul></div>`:nothing;
          })}
        </nav>
        <p class="sidebar__footer">La formation, en commun.</p>
      </aside>`:nothing}
      <div class="workspace">
      <header class="topbar"><p>${m.title}</p>${this.identity?html`<div class="topbar__identity"><span>${this.identity.username}<small>${roles[this.identity.role]}</small></span><button type="button" ?disabled=${this.busy} @click=${this.logout}>${m.logout}</button></div><button class="navigation-toggle" type="button" aria-controls="primary-navigation" aria-expanded=${this.navigationOpen} @click=${this.toggleNavigation}>Navigation</button>`:nothing}</header>
      <main class="page">
      <div class="page-header"><p class="muted">${this.identity?this.page?.group??'Navigation':'Bienvenue'}</p><h1 id="page-title" tabindex="-1">${this.identity?this.page?.label??'Page introuvable':'Votre espace formation'}</h1><p class="muted">${this.identity?this.page?.description??'Cette adresse ne correspond à aucune page.':'Connectez-vous pour retrouver votre activité et vos référentiels.'}</p></div>
      ${this.error?html`<div role="alert" tabindex="-1">${this.error}</div><button ?disabled=${this.busy} @click=${this.restore}>${m.retry}</button>`:nothing}
      <p role="status" aria-label="État de l’opération">${this.busy?m.loading:this.notice}</p>
      ${!this.initialized?nothing:!this.identity?html`
        <section aria-labelledby="login-title"><h2 id="login-title">Connexion</h2>
          <form @submit=${this.login} aria-busy=${this.busy}>
            <label for="username">${m.username}<input id="username" name="username" autocomplete="username" required maxlength="100"></label>
            <label for="password">${m.password}<input id="password" name="password" type="password" autocomplete="current-password" required></label>
            <button data-primary ?disabled=${this.busy}>${m.login}</button>
          </form>
        </section>`:html`
        ${!this.page?html`<section><h2>Page introuvable</h2><p>Vérifiez l’adresse ou revenez aux sessions.</p><a href="/sessions" @click=${this.followLink}>Revenir aux sessions</a></section>`:!canOpenPage(this.page,this.identity.permissions)?html`<section><h2>Accès non autorisé</h2><p>Votre rôle ne permet pas d’afficher cette page.</p><a href="/sessions" @click=${this.followLink}>Revenir aux sessions</a></section>`:nothing}
        ${this.page?.group==='Référentiel'?html`<nav class="reference-navigation" aria-label="Référentiel">${referenceItems.map(page=>html`<a href=${page.path} aria-current=${this.page?.id===page.id?'page':nothing} @click=${this.followLink}>${page.label}</a>`)}</nav>`:nothing}
        ${this.isVisited('domaines')?html`<div data-page="domaines" ?hidden=${this.page?.id!=='domaines'} ?inert=${this.page?.id!=='domaines'}><domains-panel></domains-panel></div>`:nothing}
        ${this.isVisited('sous-domaines')?html`<div data-page="sous-domaines" ?hidden=${this.page?.id!=='sous-domaines'} ?inert=${this.page?.id!=='sous-domaines'}><subdomains-panel></subdomains-panel></div>`:nothing}
        ${this.isVisited('competences')?html`<div data-page="competences" ?hidden=${this.page?.id!=='competences'} ?inert=${this.page?.id!=='competences'}><competencies-panel></competencies-panel></div>`:nothing}
        ${this.isVisited('explorateur')?html`<div data-page="explorateur" ?hidden=${this.page?.id!=='explorateur'} ?inert=${this.page?.id!=='explorateur'}><reference-explorer></reference-explorer></div>`:nothing}
        ${this.isVisited('profils')?html`<div data-page="profils" ?hidden=${this.page?.id!=='profils'} ?inert=${this.page?.id!=='profils'}><profiles-panel .entityId=${this.page?.id==='profils'?this.page.entityId:undefined} .section=${this.page?.id==='profils'?this.page.section:undefined}></profiles-panel></div>`:nothing}
        ${this.isVisited('catalogue')?html`<div data-page="catalogue" ?hidden=${this.page?.id!=='catalogue'} ?inert=${this.page?.id!=='catalogue'}><formations-panel .entityId=${this.page?.id==='catalogue'?this.page.entityId:undefined} .section=${this.page?.id==='catalogue'?this.page.section:undefined} @sessions-changed=${()=>this.run(async()=>{this.sessions=await api.sessions();this.auditRevision++;})} @formations-changed=${()=>{this.auditRevision++;}}></formations-panel></div>`:nothing}
        ${this.isVisited('classifications')?html`<div data-page="classifications" ?hidden=${this.page?.id!=='classifications'} ?inert=${this.page?.id!=='classifications'}><classifications-panel></classifications-panel></div>`:nothing}
        ${this.isVisited('intervenants')?html`<div data-page="intervenants" ?hidden=${this.page?.id!=='intervenants'} ?inert=${this.page?.id!=='intervenants'}><instructors-panel></instructors-panel></div>`:nothing}
        ${this.isVisited('collaborateurs')?html`<div data-page="collaborateurs" ?hidden=${this.page?.id!=='collaborateurs'} ?inert=${this.page?.id!=='collaborateurs'}><collaborators-panel .entityId=${this.page?.id==='collaborateurs'?this.page.entityId:undefined} .section=${this.page?.id==='collaborateurs'?this.page.section:undefined}></collaborators-panel></div>`:nothing}
        ${this.isVisited('sessions')?html`<div data-page="sessions" ?hidden=${this.page?.id!=='sessions'} ?inert=${this.page?.id!=='sessions'}>
        <section class="sessions-list" aria-label="Liste des sessions" ?hidden=${Boolean(this.selected)} ?inert=${Boolean(this.selected)}>
          <div class="sessions-filters">
            <label for="session-query">Rechercher une session<input id="session-query" type="search" .value=${this.sessionQuery} @input=${(event:Event)=>{this.sessionQuery=(event.target as HTMLInputElement).value;}} placeholder="Intitulé ou état"></label>
            <label for="session-state">État de la session<select id="session-state" .value=${this.sessionState} @change=${(event:Event)=>{this.sessionState=(event.target as HTMLSelectElement).value;}}><option value="">Tous les états</option>${[...new Set(this.sessions.map(session=>session.state))].map(state=>html`<option value=${state}>${states[state]??state}</option>`)}</select></label>
            ${this.sessionQuery||this.sessionState?html`<button type="button" @click=${()=>{this.sessionQuery='';this.sessionState='';}}>Effacer les filtres</button>`:nothing}
          </div>
          <p role="status" aria-label="Résultats des sessions">${this.visibleSessions.length} session${this.visibleSessions.length===1?'':'s'} sur ${this.sessions.length}</p>
          ${this.sessions.length?this.visibleSessions.length?html`<div class="table-container" role="region" aria-labelledby="sessions-caption" tabindex="0"><table><caption id="sessions-caption">${m.sessions}</caption><thead><tr><th scope="col">Session</th><th scope="col">État</th><th scope="col">Participations</th></tr></thead><tbody>${this.visibleSessions.map(session=>html`<tr><th scope="row">${session.title}</th><td><span class="session-state" data-state=${session.state}>${states[session.state]??session.state}</span></td><td><button type="button" data-session-id=${session.id} ?disabled=${this.busy} aria-label=${`Ouvrir les participations de ${session.title}`} @click=${()=>this.select(session)}>Ouvrir les participations</button></td></tr>`)}</tbody></table></div>`:html`<p>Aucune session ne correspond aux filtres. Modifiez votre recherche ou effacez les filtres.</p>`:html`<p>${m.empty}</p>`}
        </section>
        ${this.selected?html`<section aria-labelledby="participants-title">
          <button type="button" ?disabled=${this.busy} @click=${this.returnToSessions}>Retour à la liste des sessions</button>
          <div class="participants-header"><h2 id="participants-title" tabindex="-1">${m.participants} — ${this.selected.title}</h2><p><span class="session-state" data-state=${this.selected.state}>${states[this.selected.state]??this.selected.state}</span> · ${this.participants.length} participant${this.participants.length===1?'':'s'}</p></div>
          ${this.identity.permissions.includes('MANAGE_PARTICIPATION')&&this.selected.state==='PLANIFIEE'?html`<session-enrollment .sessionId=${this.selected.id} .participants=${this.participants} @participations-changed=${()=>this.run(async()=>{this.participants=await api.participants(this.selected!.id);this.auditRevision++;})}></session-enrollment>`:nothing}
          ${this.participants.length?html`<div class="table-container" role="region" aria-label="Participants de la session" tabindex="0"><table><caption>Suivi des participations</caption><thead><tr><th scope="col">Collaborateur</th><th scope="col">Identifiant professionnel</th><th scope="col">État</th><th scope="col">Présence</th></tr></thead><tbody>${this.participants.map(person=>html`<tr><th scope="row">${person.name}</th><td>${person.professionalId}</td><td>${states[person.state]??person.state}</td><td><div class="actions"><button type="button" ?disabled=${this.busy} aria-label=${`Marquer ${person.name} présente`} @click=${()=>this.presence(person,'PRESENTE')}>Présente</button><button type="button" ?disabled=${this.busy} aria-label=${`Marquer ${person.name} absente`} @click=${()=>this.presence(person,'ABSENTE')}>Absente</button></div></td></tr>`)}</tbody></table></div>`:html`<p>${m.noParticipants}</p>`}
        </section>`:nothing}
        </div>`:nothing}
        ${this.isVisited('pilotage')?html`<div data-page="pilotage" ?hidden=${this.page?.id!=='pilotage'} ?inert=${this.page?.id!=='pilotage'}><reporting-panel></reporting-panel></div>`:nothing}
        ${this.isVisited('acces')?html`<div data-page="acces" ?hidden=${this.page?.id!=='acces'} ?inert=${this.page?.id!=='acces'}><section aria-labelledby="accounts-title"><h2 id="accounts-title" tabindex="-1">${m.accounts}</h2><ul>${this.accounts.map(account=>html`<li><form @submit=${(event:SubmitEvent)=>this.changeRole(event,account)}>
          <label for=${`role-${account.username}`}>Rôle de ${account.username}</label><select id=${`role-${account.username}`} name="role" .value=${account.role}>${(Object.keys(roles) as Role[]).map(role=>html`<option value=${role} ?selected=${account.role===role}>${roles[role]}</option>`)}</select>
          <button ?disabled=${this.busy}>Enregistrer le rôle de ${account.username}</button>
        </form></li>`)}</ul></section></div>`:nothing}
        ${this.isVisited('journal')?html`<div data-page="journal" ?hidden=${this.page?.id!=='journal'} ?inert=${this.page?.id!=='journal'}><audit-log .revision=${this.auditRevision} .sessions=${this.sessions}></audit-log></div>`:nothing}
      `}
      </main></div></div>
      <dialog id="confirm-role" aria-labelledby="confirm-title" aria-describedby="confirm-description"><form method="dialog"><h2 id="confirm-title">${m.confirm}</h2><p id="confirm-description"></p><div class="actions"><button value="cancel" autofocus>${m.cancel}</button><button value="confirm">Confirmer</button></div></form></dialog>
    `;
  }
}
customElements.define('access-app',AccessApp);
