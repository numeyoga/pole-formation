import {LitElement,css,html,nothing} from 'lit';
import {sessionsApi,SessionError} from '../adapters/sessions-api';
import type {SessionView,SessionSummary} from '../presentation/models';
import type {FormationView} from '../../formations/presentation/models';
import {messages,sessionMessages as m} from '../../../shared/i18n/fr';

export class FormationSessions extends LitElement {
 static properties={formation:{state:true},items:{state:true},selected:{state:true},busy:{state:true},error:{state:true},notice:{state:true},fields:{state:true}};
 declare private formation:FormationView|null;
 declare private items:SessionSummary[];
 declare private selected:SessionView|null;
 declare private busy:boolean;
 declare private error:string;
 declare private notice:string;
 declare private fields:Record<string,string>;
 constructor(){super();this.formation=null;this.items=[];this.selected=null;this.busy=false;this.error='';this.notice='';this.fields={};}
 private generation=0;
 static styles=css`
  :host{display:block;}*{box-sizing:border-box;}
  dialog{inline-size:var(--control-width);max-inline-size:calc(100% - var(--space-page));max-block-size:calc(100% - var(--space-page));overflow:auto;padding:var(--space-section);color:var(--color-text);background:var(--color-surface);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);}
  h2{font-size:var(--text-section);}h3{font-size:var(--text-base);}p,li{overflow-wrap:anywhere;}
  form,fieldset,.form-field{display:grid;gap:var(--space-small);}form{margin-block:var(--space-normal);}fieldset{border:0;padding:0;margin:0;min-inline-size:0;}
  .actions{display:flex;flex-wrap:wrap;gap:var(--space-small);margin-block:var(--space-normal);}
  input,textarea,button{font:inherit;min-block-size:var(--control-height);padding:var(--space-control);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);color:var(--color-text);background:var(--color-surface);}
  input,textarea{inline-size:100%;min-inline-size:0;max-inline-size:100%;}button{cursor:pointer;color:var(--color-primary);max-inline-size:100%;}button:disabled{opacity:var(--disabled-opacity);cursor:wait;}
  :focus-visible{outline:var(--focus-width) solid var(--color-focus);outline-offset:var(--focus-width);}
  [role=alert],.field-error{color:var(--color-danger);}[role=status]{color:var(--color-success);}[aria-invalid=true]{border-color:var(--color-danger);}
 `;
 disconnectedCallback(){super.disconnectedCallback();this.generation++;}
 private dialog(){return this.renderRoot.querySelector<HTMLDialogElement>('dialog')!;}
 private async focusElement(selector:string){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>(selector)?.focus();}
 async show(formation:FormationView){
  this.formation=formation;this.selected=null;this.items=[];this.notice='';this.error='';this.fields={};
  await this.updateComplete;this.renderRoot.querySelector<HTMLFormElement>('#session-create')?.reset();this.dialog().showModal();await this.load();await this.focusElement('button[autofocus]');
 }
 private async perform(work:()=>Promise<void>,success=''){
  if(this.busy)return;const generation=++this.generation;this.busy=true;this.error='';this.fields={};this.notice='';
  try{await work();if(generation===this.generation)this.notice=success;}
  catch(error){if(generation===this.generation){this.error=error instanceof Error?error.message:messages.network;this.fields=error instanceof SessionError?error.fields:{};await this.focusElement('#session-error');}}
  finally{if(generation===this.generation)this.busy=false;}
 }
 private async load(){await this.perform(async()=>{this.items=await sessionsApi.list(this.formation!.id);});}
 private changed(){this.dispatchEvent(new CustomEvent('sessions-changed',{bubbles:true,composed:true}));}
 private async create(event:SubmitEvent){
  event.preventDefault();const form=event.currentTarget as HTMLFormElement;const values=new FormData(form);const capacity=String(values.get('capacity')).trim();
  await this.perform(async()=>{const created=await sessionsApi.create(this.formation!.id,{title:String(values.get('title')),capacity:capacity?Number(capacity):null,modalities:String(values.get('modalities'))});this.selected=await sessionsApi.get(created.id);form.reset();this.changed();await this.focusElement('#session-detail-title');},m.saved);
 }
 private async open(id:string){await this.perform(async()=>{this.selected=await sessionsApi.get(id);await this.focusElement('#session-detail-title');});}
 private async back(){this.selected=null;await this.load();await this.focusElement('#session-list-title');}
 private async addSlot(event:SubmitEvent){
  event.preventDefault();const form=event.currentTarget as HTMLFormElement;const values=new FormData(form);const item=this.selected!;
  await this.perform(async()=>{await sessionsApi.addSlot(item,String(values.get('startsAt')),String(values.get('endsAt')),String(values.get('offset')));this.selected=await sessionsApi.get(item.id);form.reset();this.changed();await this.focusElement('#session-detail-title');},m.slotSaved);
 }
 private async plan(){const item=this.selected!;await this.perform(async()=>{await sessionsApi.plan(item);this.selected=await sessionsApi.get(item.id);this.changed();await this.focusElement('#session-detail-title');},m.planned);}
 private field(name:string,label:string,type='text',required=false,help=''){
  const error=this.fields[name];const described=[help,error?`${name}-error`:''].filter(Boolean).join(' ');
  return html`<div class="form-field"><label for=${`session-${name}`}>${label}</label><input id=${`session-${name}`} name=${name} type=${type} ?required=${required} min=${type==='number'?'1':nothing} max=${type==='number'?'2147483647':nothing} step=${type==='number'?'1':nothing} maxlength=${name==='title'?200:nothing} aria-invalid=${error?'true':'false'} aria-describedby=${described||nothing}>${error?html`<p class="field-error" id=${`${name}-error`}>${error}</p>`:nothing}</div>`;
 }
 render(){const item=this.selected;return html`<dialog aria-labelledby="session-list-title" @cancel=${(event:Event)=>{if(this.busy)event.preventDefault();}}>
  <h2 id="session-list-title" tabindex="-1">${m.title} — ${this.formation?.title}</h2>
  <button type="button" ?disabled=${this.busy} @click=${()=>this.dialog().close()} autofocus>${m.close}</button>
  <p role="status" aria-label=${m.status}>${this.busy?m.loading:this.notice}</p>
  ${this.error?html`<p id="session-error" role="alert" tabindex="-1">${this.error}</p><button type="button" ?disabled=${this.busy} @click=${()=>item?this.open(item.id):this.load()}>${m.refresh}</button>`:nothing}
  ${item?html`<h3 id="session-detail-title" tabindex="-1">${item.title} — ${item.status}</h3><p>${item.capacityLabel}</p><p>${item.modalities}</p>
   ${item.slots.length?html`<ol>${item.slots.map(slot=>html`<li>${slot.start} — ${slot.end}</li>`)}</ol>`:html`<p>${m.noSlots}</p>`}
   ${item.state==='BROUILLON'?html`<p id="session-time-help">${m.timeHelp}</p><form aria-labelledby="session-slot-title" @submit=${this.addSlot}><fieldset ?disabled=${this.busy}><legend id="session-slot-title">${m.slot}</legend>
    ${this.field('startsAt',m.start,'datetime-local',true,'session-time-help')}${this.field('endsAt',m.end,'datetime-local',true,'session-time-help')}
    <div class="form-field"><label for="session-offset">${m.offset}</label><input id="session-offset" name="offset" value="Z" required pattern="Z|[+][0-9]{2}:[0-9]{2}|-[0-9]{2}:[0-9]{2}" aria-describedby="session-time-help"></div><button type="submit">${m.slot}</button>
   </fieldset></form><p>${m.noInstructor}</p><button type="button" ?disabled=${this.busy} @click=${this.plan}>${m.plan}</button>`:nothing}
   <div class="actions"><button type="button" ?disabled=${this.busy} @click=${this.back}>${m.back}</button><button type="button" ?disabled=${this.busy} @click=${()=>this.open(item.id)}>${m.refresh}</button></div>
  `:html`${this.items.length?html`<ul>${this.items.map(session=>html`<li><button type="button" ?disabled=${this.busy} aria-label=${`${m.details} ${session.title}`} @click=${()=>this.open(session.id)}>${session.title}</button> — ${session.status}</li>`)}</ul>`:this.busy?nothing:html`<p>${m.empty}</p>`}
   <button type="button" ?disabled=${this.busy} @click=${this.load}>${m.reload}</button>
   ${this.formation?.state==='ACTIVE'?html`<form id="session-create" aria-labelledby="session-create-title" @submit=${this.create}><fieldset ?disabled=${this.busy}><legend id="session-create-title">${m.create}</legend>
    ${this.field('title',m.label,'text',true)}${this.field('capacity',m.capacity,'number',false,'session-capacity-help')}<p id="session-capacity-help">${m.capacityHelp}</p>
    <label for="session-modalities">${m.modalities}</label><textarea id="session-modalities" name="modalities" maxlength="4000" rows="3"></textarea><button type="submit">${m.create}</button>
   </fieldset></form>`:html`<p>${m.createHelp}</p>`}
  `}
 </dialog>`;}
}
customElements.define('formation-sessions',FormationSessions);
