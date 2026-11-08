import { LitElement,html,css,nothing,type PropertyValues } from 'lit';
import { readAudit } from '../adapters/audit-api';
import type { AuditEventView,AuditFilters } from '../presentation/models';
import type { SessionView } from '../../access/presentation/models';
import { ApiError } from '../../access/adapters/access-api';
import { messages } from '../../../shared/i18n/fr';

export class AuditLog extends LitElement {
  static properties={revision:{type:Number},sessions:{attribute:false},items:{state:true},busy:{state:true},error:{state:true},nextCursor:{state:true},loaded:{state:true}};
  declare revision:number;
  declare sessions:SessionView[];
  declare items:AuditEventView[];
  declare busy:boolean;
  declare error:string;
  declare nextCursor:string|null;
  declare loaded:boolean;
  private filters:AuditFilters={};
  private requestId=0;
  constructor(){super();this.revision=0;this.sessions=[];this.items=[];this.busy=false;this.error='';this.nextCursor=null;this.loaded=false;}
  static styles=css`
    :host{display:block;margin-block-start:var(--space-section);padding:var(--space-section);background:var(--color-surface);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);}
    *{box-sizing:border-box;}
    h2{font-size:var(--text-section);margin:0;}
    h3{font-size:var(--text-base);margin:0;}
    form,label,ol,article,dl{display:grid;gap:var(--space-small);}
    form{margin-block:var(--space-normal);}
    input,select,button{font:inherit;min-block-size:var(--control-height);padding:var(--space-control);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);}
    input,select{max-inline-size:var(--control-width);inline-size:100%;background:var(--color-surface);color:var(--color-text);}
    button{inline-size:fit-content;max-inline-size:100%;background:var(--color-surface);color:var(--color-primary);cursor:pointer;}
    button:hover{color:var(--color-hover);text-decoration:underline;}
    button:disabled{opacity:var(--disabled-opacity);cursor:wait;}
    :focus-visible{outline:var(--focus-width) solid var(--color-focus);outline-offset:var(--focus-width);}
    ol{padding-inline-start:var(--space-section);}
    li{padding-block:var(--space-normal);overflow-wrap:anywhere;}
    dl{grid-template-columns:auto 1fr;}
    dt{font-weight:bold;}dd{margin:0;min-inline-size:0;overflow-wrap:anywhere;}
    p{margin-block:var(--space-small);}
    [role=alert]{color:var(--color-danger);}
  `;
  protected updated(changes:PropertyValues){if(changes.has('revision'))void this.load(false,false);}
  disconnectedCallback(){super.disconnectedCallback();this.requestId++;}
  async focusHeading(){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#audit-title')?.focus();}
  private async load(append=false,focus=true){
    const request=++this.requestId;this.busy=true;this.error='';
    if(!append){this.items=[];this.nextCursor=null;this.loaded=false;}
    try{
      const result=await readAudit(this.filters,append?this.nextCursor??undefined:undefined);
      if(request!==this.requestId)return;
      this.items=append?[...this.items,...result.items]:result.items;this.nextCursor=result.nextCursor;this.loaded=true;
      if(focus){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#audit-result')?.focus();}
    }catch(error){
      if(request!==this.requestId)return;
      if(error instanceof ApiError && [401,403].includes(error.status)){this.items=[];this.nextCursor=null;}
      this.error=error instanceof ApiError?error.message:messages.network;
      await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('[role=alert]')?.focus();
    }finally{if(request===this.requestId)this.busy=false;}
  }
  private submit(event:SubmitEvent){
    event.preventDefault();const data=new FormData(event.currentTarget as HTMLFormElement);
    this.filters={};const type=String(data.get('type'));const session=String(data.get('session'));const subject=String(data.get('subject')).trim();
    if(type)this.filters.subjectType=type as AuditFilters['subjectType'];if(session)this.filters.sessionId=session;if(subject)this.filters.subjectId=subject;
    void this.load();
  }
  render(){return html`
    <section aria-labelledby="audit-title"><h2 id="audit-title" tabindex="-1">Journal des changements sensibles</h2>
      <form @submit=${this.submit}>
        <label for="audit-type">Type d’objet</label><select id="audit-type" name="type">
          <option value="">Tous les types</option>
          <option value="COMPTE">Comptes</option>
          <option value="PARTICIPATION">Participations</option>
          <option value="CRENEAU">Créneaux</option>
          <option value="AFFECTATIONS">Affectations</option>
        </select>
        <label for="audit-session">Session</label><select id="audit-session" name="session"><option value="">Toutes les sessions</option>${this.sessions.map(s=>html`<option value=${s.id}>${s.title}</option>`)}</select>
        <label for="audit-subject">Identifiant de l’objet (facultatif)</label><input id="audit-subject" name="subject" maxlength="100" type="search">
        <button ?disabled=${this.busy}>Filtrer le journal</button>
      </form>
      ${this.error?html`<p role="alert" tabindex="-1">${this.error}</p><button @click=${()=>this.load(false)} ?disabled=${this.busy}>Réessayer le journal</button>`:nothing}
      <p role="status" aria-label="État du journal" id="audit-result" tabindex="-1">${this.busy?'Chargement du journal…':this.loaded?`${this.items.length} événement(s) affiché(s).`:''}</p>
      ${this.loaded&&!this.items.length?html`<p>Aucun changement sensible pour ces filtres.</p>`:nothing}
      ${this.items.length?html`<ol>${this.items.map(item=>html`<li><article aria-labelledby=${`event-${item.id}`}><h3 id=${`event-${item.id}`}>${item.action}</h3><p>${item.date} UTC · Auteur : ${item.actor}</p><p>${item.target}</p><dl><dt>Avant</dt><dd>${item.before.map(line=>html`<p>${line}</p>`)}</dd><dt>Après</dt><dd>${item.after.map(line=>html`<p>${line}</p>`)}</dd></dl></article></li>`)}</ol>`:nothing}
      ${this.nextCursor?html`<button ?disabled=${this.busy} @click=${()=>this.load(true)}>Afficher les événements précédents</button>`:nothing}
    </section>`;}
}
customElements.define('audit-log',AuditLog);
