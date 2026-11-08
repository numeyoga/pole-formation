import { LitElement, css, html, nothing } from 'lit';
import { api, ApiError } from '../adapters/access-api';
import type { Identity, SessionView, ParticipantView, AccountView, Role } from '../presentation/models';
import { messages as m, roles, states } from '../../../shared/i18n/fr';

export class AccessApp extends LitElement {
  static properties = {
    identity:{state:true}, sessions:{state:true}, selected:{state:true}, participants:{state:true}, accounts:{state:true},
    busy:{state:true}, error:{state:true}, notice:{state:true}, initialized:{state:true},
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
  constructor() {
    super(); this.identity=null;this.sessions=[];this.selected=null;this.participants=[];this.accounts=[];
    this.busy=false;this.error='';this.notice='';this.initialized=false;
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
    button:hover { color:var(--color-hover); text-decoration:underline; }
    button[data-primary] { color:var(--color-surface); background:var(--color-primary); }
    button[data-primary]:hover { background:var(--color-hover); }
    :focus-visible { outline:var(--focus-width) solid var(--color-focus); outline-offset:var(--focus-width); }
    button:disabled { opacity:var(--disabled-opacity); cursor:wait; }
    [role=alert] { color:var(--color-danger); padding-block:var(--space-normal); }
    [role=status] { color:var(--color-success); padding-block:var(--space-normal); }
    ul { padding-inline-start:var(--space-section); }
    li { padding-block:var(--space-small); overflow-wrap:anywhere; }
    .actions { display:flex; flex-wrap:wrap; gap:var(--space-small); margin-block-start:var(--space-small); }
    .muted { color:var(--color-muted); }
    dialog { max-inline-size:var(--control-width); padding:var(--space-section); color:var(--color-text); background:var(--color-surface); border:var(--border-width) solid var(--color-border); border-radius:var(--control-radius); }
  `;
  connectedCallback() { super.connectedCallback(); void this.restore(); }
  private async focusElement(selector:string) { await this.updateComplete; this.renderRoot.querySelector<HTMLElement>(selector)?.focus(); }
  private async run(work:()=>Promise<void>) {
    if(this.busy)return;
    this.busy=true;this.error='';this.notice='';
    try { await work(); } catch(error) {
      this.error=error instanceof Error?error.message:m.network;
      if(error instanceof ApiError && error.status===401 && this.identity) this.clearIdentity();
      void this.focusElement('[role=alert]');
    } finally { this.busy=false; }
  }
  private clearIdentity() { this.identity=null;this.sessions=[];this.accounts=[];this.selected=null;this.participants=[]; }
  private async refresh() {
    this.identity=await api.me();this.sessions=await api.sessions();
    this.accounts=this.identity.permissions.includes('WRITE_ROLES')?await api.accounts():[];
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
    await this.run(async()=>{ await api.login(String(data.get('username')),String(data.get('password')));form.reset();await this.refresh();void this.focusElement('#sessions-title'); });
  }
  private async logout() {
    await this.run(async()=>{await api.logout();this.clearIdentity();void this.focusElement('#username');});
  }
  private async select(session:SessionView) {
    await this.run(async()=>{this.selected=null;this.participants=[];const participants=await api.participants(session.id);this.selected=session;this.participants=participants;void this.focusElement('#participants-title');});
  }
  private async presence(participant:ParticipantView,state:'PRESENTE'|'ABSENTE') {
    if(!this.selected)return;const session=this.selected;
    await this.run(async()=>{await api.presence(session.id,participant.id,state);this.participants=await api.participants(session.id);this.notice=m.saved;});
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
      <header><h1>${m.title}</h1>${this.identity?html`<p>${this.identity.username} — ${roles[this.identity.role]}</p><button ?disabled=${this.busy} @click=${this.logout}>${m.logout}</button>`:nothing}</header>
      ${this.error?html`<div role="alert" tabindex="-1">${this.error}</div><button ?disabled=${this.busy} @click=${this.restore}>${m.retry}</button>`:nothing}
      <p role="status">${this.busy?m.loading:this.notice}</p>
      ${!this.initialized?nothing:!this.identity?html`
        <section aria-labelledby="login-title"><h2 id="login-title">Connexion</h2>
          <form @submit=${this.login} aria-busy=${this.busy}>
            <label for="username">${m.username}<input id="username" name="username" autocomplete="username" required maxlength="100"></label>
            <label for="password">${m.password}<input id="password" name="password" type="password" autocomplete="current-password" required></label>
            <button data-primary ?disabled=${this.busy}>${m.login}</button>
          </form>
        </section>`:html`
        <section aria-labelledby="sessions-title"><h2 id="sessions-title" tabindex="-1">${m.sessions}</h2>
          ${this.sessions.length?html`<ul>${this.sessions.map(session=>html`<li><button ?disabled=${this.busy} @click=${()=>this.select(session)}>${session.title}</button> <span class="muted">${states[session.state]}</span></li>`)}</ul>`:html`<p>${m.empty}</p>`}
        </section>
        ${this.selected?html`<section aria-labelledby="participants-title"><h2 id="participants-title" tabindex="-1">${m.participants} — ${this.selected.title}</h2>
          ${this.participants.length?html`<ul>${this.participants.map(person=>html`<li><p>${person.name} · ${person.professionalId} · ${states[person.state]}</p>
            <div class="actions"><button ?disabled=${this.busy} aria-label=${`Marquer ${person.name} présente`} @click=${()=>this.presence(person,'PRESENTE')}>Présente</button><button ?disabled=${this.busy} aria-label=${`Marquer ${person.name} absente`} @click=${()=>this.presence(person,'ABSENTE')}>Absente</button></div>
          </li>`)}</ul>`:html`<p>${m.noParticipants}</p>`}
        </section>`:nothing}
        ${this.accounts.length?html`<section aria-labelledby="accounts-title"><h2 id="accounts-title" tabindex="-1">${m.accounts}</h2><ul>${this.accounts.map(account=>html`<li><form @submit=${(event:SubmitEvent)=>this.changeRole(event,account)}>
          <label for=${`role-${account.username}`}>Rôle de ${account.username}</label><select id=${`role-${account.username}`} name="role" .value=${account.role}>${(Object.keys(roles) as Role[]).map(role=>html`<option value=${role} ?selected=${account.role===role}>${roles[role]}</option>`)}</select>
          <button ?disabled=${this.busy}>Enregistrer le rôle de ${account.username}</button>
        </form></li>`)}</ul></section>`:nothing}
      `}
      <dialog id="confirm-role" aria-labelledby="confirm-title" aria-describedby="confirm-description"><form method="dialog"><h2 id="confirm-title">${m.confirm}</h2><p id="confirm-description"></p><div class="actions"><button value="cancel" autofocus>${m.cancel}</button><button value="confirm">Confirmer</button></div></form></dialog>
    `;
  }
}
customElements.define('access-app',AccessApp);
