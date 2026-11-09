import { LitElement,html,css,nothing } from 'lit';
import { formationsApi,FormationError } from '../adapters/formations-api';
import type { FormationView,FormationPage,FormationAction,FormationSession,FormationFields } from '../presentation/models';
import { ApiError } from '../../../shared/http/session';
import { messages,formationMessages as m } from '../../../shared/i18n/fr';

interface SessionState {busy:boolean;items:FormationSession[];error:string}
export class FormationsPanel extends LitElement {
  static properties={data:{state:true},busy:{state:true},error:{state:true},notice:{state:true},editing:{state:true},pending:{state:true},formError:{state:true},fields:{state:true},stale:{state:true},sessionViews:{state:true}};
  declare data:FormationPage|null;declare busy:boolean;declare error:string;declare notice:string;
  declare editing:FormationView|null;declare pending:{item:FormationView;action:FormationAction}|null;
  declare formError:string;declare fields:Record<string,string>;declare stale:boolean;declare sessionViews:Record<string,SessionState>;
  private generation=0;
  constructor(){super();this.data=null;this.busy=false;this.error='';this.notice='';this.editing=null;this.pending=null;this.formError='';this.fields={};this.stale=false;this.sessionViews={};}
  static styles=css`
    :host{display:block;margin-block-start:var(--space-section);padding:var(--space-section);background:var(--color-surface);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);}
    *{box-sizing:border-box;}h2{font-size:var(--text-section);margin:0;}p{margin-block:var(--space-small);}
    header,.actions,nav{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-small);}
    form,fieldset,label{display:grid;gap:var(--space-small);}fieldset{border:0;padding:0;margin:0;min-inline-size:0;}
    input,textarea,select,button{font:inherit;min-block-size:var(--control-height);padding:var(--space-control);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);}
    input,textarea,select{max-inline-size:100%;color:var(--color-text);background:var(--color-surface);}
    button{inline-size:fit-content;max-inline-size:100%;color:var(--color-primary);background:var(--color-surface);cursor:pointer;}
    button:hover{color:var(--color-hover);text-decoration:underline;}button:disabled{opacity:var(--disabled-opacity);cursor:default;}
    [aria-invalid=true]{border-color:var(--color-danger);}[role=alert],.field-error{color:var(--color-danger);}
    [role=status]{color:var(--color-success);}
    :focus-visible{outline:var(--focus-width) solid var(--color-focus);outline-offset:var(--focus-width);}
    .table-container{overflow:auto;margin-block:var(--space-normal);}table{inline-size:100%;min-inline-size:var(--table-min-width);border-collapse:collapse;}
    caption{text-align:start;padding-block:var(--space-small);}th,td{text-align:start;vertical-align:top;padding:var(--space-control);border-block-end:var(--border-width) solid var(--color-border);overflow-wrap:anywhere;}
    td:nth-child(3){white-space:nowrap;}
    summary{cursor:pointer;min-block-size:var(--control-height);padding-block:var(--space-small);}
    dialog{max-block-size:calc(100% - var(--space-page));overflow:auto;inline-size:var(--control-width);max-inline-size:calc(100% - var(--space-page));padding:var(--space-section);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);color:var(--color-text);background:var(--color-surface);}
  `;
  connectedCallback(){super.connectedCallback();void this.load();}
  disconnectedCallback(){super.disconnectedCallback();this.generation++;}
  async focusHeading(){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#formations-title')?.focus();}
  private message(error:unknown){return error instanceof ApiError?error.message:messages.network;}
  private async load(page=0){
    const generation=++this.generation;this.busy=true;this.error='';this.sessionViews={};
    try{const data=await formationsApi.list(page);if(generation===this.generation){this.data=data;await this.updateComplete;for(const details of this.renderRoot.querySelectorAll<HTMLDetailsElement>('details[open]'))details.open=false;}}
    catch(error){if(generation===this.generation){this.error=this.message(error);if(error instanceof ApiError&&[401,403].includes(error.status))this.data=null;}}
    finally{if(generation===this.generation)this.busy=false;}
  }
  private dialog(id:string){return this.renderRoot.querySelector<HTMLDialogElement>(id)!;}
  private async prepareForm(){
    await this.updateComplete;const form=this.renderRoot.querySelector<HTMLFormElement>('#formation-form')!;form.reset();
    for(const key of ['code','title','objectives','description','durationMinutes'] as const){(form.elements.namedItem(key) as HTMLInputElement|HTMLTextAreaElement).value=String(this.editing?.[key]??'');}
  }
  private async open(item:FormationView|null){this.editing=item;this.formError='';this.fields={};this.stale=false;this.notice='';await this.prepareForm();this.dialog('#formation-editor').showModal();}
  private changed(){this.dispatchEvent(new CustomEvent('formations-changed',{bubbles:true,composed:true}));}
  private async submit(event:SubmitEvent){
    event.preventDefault();if(this.busy)return;
    const data=new FormData(event.currentTarget as HTMLFormElement);const duration=String(data.get('durationMinutes')).trim();
    const values:FormationFields={code:String(data.get('code')),title:String(data.get('title')),objectives:String(data.get('objectives')),description:String(data.get('description')),durationMinutes:duration?Number(duration):null};
    this.busy=true;this.formError='';this.fields={};this.stale=false;
    try{
      if(this.editing)await formationsApi.update(this.editing,values);else await formationsApi.create(values);
      this.dialog('#formation-editor').close();await this.load(this.data?.page??0);this.notice=m.saved;this.changed();await this.focusHeading();
    }catch(error){this.formError=this.message(error);this.fields=error instanceof FormationError?error.fields:{};this.stale=error instanceof FormationError&&error.status===409&&!Object.keys(error.fields).length;await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#formation-form-error')?.focus();}
    finally{this.busy=false;}
  }
  private async reloadEditing(){
    if(!this.editing)return;this.busy=true;let loaded=false;
    try{this.editing=await formationsApi.get(this.editing.id);this.formError='';this.fields={};this.stale=false;await this.prepareForm();loaded=true;}
    catch(error){this.formError=this.message(error);}finally{this.busy=false;}
    if(loaded){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#formation-code')?.focus();}
  }
  private transitionTitle(action:FormationAction){return action==='activation'?m.activateTitle:action==='archivage'?m.archiveTitle:m.reactivateTitle;}
  private async confirm(item:FormationView,action:FormationAction){this.pending={item,action};this.formError='';this.stale=false;this.notice='';await this.updateComplete;this.dialog('#formation-transition').showModal();}
  private async transition(){
    if(!this.pending||this.busy)return;this.busy=true;this.formError='';this.stale=false;
    try{await formationsApi.transition(this.pending.item,this.pending.action);this.dialog('#formation-transition').close();await this.load(this.data?.page??0);this.notice=m.changed;this.changed();await this.focusHeading();}
    catch(error){this.formError=this.message(error);this.stale=error instanceof ApiError&&error.status===409;await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#transition-error')?.focus();}
    finally{this.busy=false;}
  }
  private async reloadPending(){
    if(!this.pending)return;this.busy=true;let loaded=false;
    try{this.pending={...this.pending,item:await formationsApi.get(this.pending.item.id)};this.formError='';this.stale=false;loaded=true;}
    catch(error){this.formError=this.message(error);}finally{this.busy=false;}
    if(loaded){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#confirm-formation-transition')?.focus();}
  }
  private async loadSessions(item:FormationView){
    const generation=this.generation;this.sessionViews={...this.sessionViews,[item.id]:{busy:true,items:[],error:''}};
    try{const items=await formationsApi.sessions(item.id);if(generation===this.generation)this.sessionViews={...this.sessionViews,[item.id]:{busy:false,items,error:''}};}
    catch(error){if(generation===this.generation)this.sessionViews={...this.sessionViews,[item.id]:{busy:false,items:[],error:this.message(error)}};}
  }
  private async showSessions(event:Event,item:FormationView){if((event.currentTarget as HTMLDetailsElement).open&&!this.sessionViews[item.id])await this.loadSessions(item);}
  private field(name:keyof FormationFields,label:string,type:'text'|'textarea'|'number'='text',required=false,maxlength=4000){
    const error=this.fields[name];const help=name==='code'?'formation-code-help':name==='durationMinutes'?'formation-duration-help':'';
    const described=[help,error?`formation-${name}-error`:''].filter(Boolean).join(' ');
    return html`<label for=${`formation-${name}`}>${label}</label>${type==='textarea'?html`<textarea id=${`formation-${name}`} name=${name} maxlength=${maxlength} rows="3" aria-invalid=${error?'true':'false'} aria-describedby=${described||nothing}></textarea>`:html`<input id=${`formation-${name}`} name=${name} type=${type} ?required=${required} maxlength=${maxlength} min=${type==='number'?'1':nothing} max=${type==='number'?'2147483647':nothing} step=${type==='number'?'1':nothing} aria-invalid=${error?'true':'false'} aria-describedby=${described||nothing}>`}${error?html`<p class="field-error" id=${`formation-${name}-error`}>${error}</p>`:nothing}`;
  }
  render(){return html`
    <section aria-labelledby="formations-title"><header><h2 id="formations-title" tabindex="-1">${m.title}</h2><button type="button" ?disabled=${this.busy} @click=${()=>this.open(null)}>${m.create}</button><button type="button" ?disabled=${this.busy} @click=${()=>this.load(this.data?.page??0)}>${m.refresh}</button></header>
      ${this.error?html`<p role="alert">${this.error}</p>`:nothing}<p role="status" aria-label=${m.status}>${this.busy?m.loading:this.notice}</p>
      ${this.data&&!this.data.items.length?html`<p>${m.empty}</p>`:nothing}
      ${this.data?.items.length?html`<div class="table-container" tabindex="0" role="region" aria-label=${m.table}><table><caption>${m.caption}</caption><thead><tr><th scope="col">${m.code}</th><th scope="col">${m.label}</th><th scope="col">${m.state}</th><th scope="col">${m.actions}</th></tr></thead><tbody>${this.data.items.map(item=>html`<tr><td>${item.code}</td><td>${item.title}<p>${item.objectives}</p><p>${item.description}</p><p>${item.durationMinutes===null?'':`${item.durationMinutes} min`}</p></td><td>${item.status}</td><td><div class="actions">
        <button type="button" ?disabled=${this.busy} aria-label=${`${m.modify} ${item.title}`} @click=${()=>this.open(item)}>${m.modify}</button>
        ${item.state==='BROUILLON'?html`<button type="button" ?disabled=${this.busy} aria-label=${`${m.activate} ${item.title}`} @click=${()=>this.confirm(item,'activation')}>${m.activate}</button>`:nothing}
        ${item.state!=='ARCHIVEE'?html`<button type="button" ?disabled=${this.busy} aria-label=${`${m.archive} ${item.title}`} @click=${()=>this.confirm(item,'archivage')}>${m.archive}</button>`:html`<button type="button" ?disabled=${this.busy} aria-label=${`${m.reactivate} ${item.title}`} @click=${()=>this.confirm(item,'reactivation')}>${m.reactivate}</button>`}
      </div><details @toggle=${(event:Event)=>this.showSessions(event,item)}><summary>${m.sessions} ${item.title}</summary>${this.sessionViews[item.id]?.busy?html`<p role="status">${m.sessionsLoading}</p>`:this.sessionViews[item.id]?.error?html`<p role="alert">${this.sessionViews[item.id].error}</p><button type="button" @click=${()=>this.loadSessions(item)}>${m.sessionsRetry}</button>`:this.sessionViews[item.id]?.items.length?html`<ul>${this.sessionViews[item.id].items.map(session=>html`<li>${session.title} — ${session.status}</li>`)}</ul>`:html`<p>${m.sessionsEmpty}</p>`}</details></td></tr>`)}</tbody></table></div>`:nothing}
      ${this.data&&this.data.total>this.data.size?html`<nav aria-label=${m.pagination}><button type="button" ?disabled=${this.busy||this.data.page===0} @click=${()=>this.load(this.data!.page-1)}>${m.previous}</button><span aria-current="page">Page ${this.data.page+1}</span><button type="button" ?disabled=${this.busy||(this.data.page+1)*this.data.size>=this.data.total} @click=${()=>this.load(this.data!.page+1)}>${m.next}</button></nav>`:nothing}
    </section>
    <dialog id="formation-editor" aria-labelledby="formation-editor-title" @cancel=${(event:Event)=>{if(this.busy)event.preventDefault();}}><h2 id="formation-editor-title">${this.editing?m.edit:m.create}</h2><p role="status" aria-label=${m.formStatus}>${this.busy?m.saving:''}</p>
      ${this.formError?html`<p id="formation-form-error" role="alert" tabindex="-1">${this.formError}</p>`:nothing}${this.stale?html`<button type="button" ?disabled=${this.busy} @click=${this.reloadEditing}>${m.reload}</button>`:nothing}
      <form id="formation-form" @submit=${this.submit}><fieldset ?disabled=${this.busy}>
        ${this.field('code',m.code,'text',true,64)}<p id="formation-code-help">${m.codeHelp}</p>
        ${this.field('title',m.label,'text',true,200)}${this.field('objectives',m.objectives,'textarea')}${this.field('description',m.description,'textarea')}
        ${this.field('durationMinutes',m.duration,'number')}<p id="formation-duration-help">${m.durationHelp}</p>
        <div class="actions"><button type="button" @click=${()=>this.dialog('#formation-editor').close()}>${m.cancel}</button><button type="submit">${m.save}</button></div>
      </fieldset></form>
    </dialog>
    <dialog id="formation-transition" aria-labelledby="transition-title" @cancel=${(event:Event)=>{if(this.busy)event.preventDefault();}}><h2 id="transition-title">${this.pending?this.transitionTitle(this.pending.action):''}</h2><p>${this.pending?.item.title} — ${this.pending?.item.status}</p><p>${this.pending?.action==='archivage'?m.archivingHelp:m.activationHelp}</p>
      <p role="status" aria-label=${m.transitionStatus}>${this.busy?m.saving:''}</p>${this.formError?html`<p id="transition-error" role="alert" tabindex="-1">${this.formError}</p>`:nothing}${this.stale?html`<button type="button" ?disabled=${this.busy} @click=${this.reloadPending}>${m.reload}</button>`:nothing}
      <div class="actions"><button type="button" ?disabled=${this.busy} @click=${()=>this.dialog('#formation-transition').close()} autofocus>${m.cancel}</button><button id="confirm-formation-transition" type="button" ?disabled=${this.busy||this.stale} @click=${this.transition}>${m.confirm}</button></div>
    </dialog>
  `;}
}
customElements.define('formations-panel',FormationsPanel);
