import {LitElement,css,html,nothing} from 'lit';
import {sessionsApi,SessionError} from '../adapters/sessions-api';
import type {SessionView,SessionSummary} from '../presentation/models';
import type {FormationView} from '../../formations/presentation/models';
import {messages,sessionMessages as m} from '../../../shared/i18n/fr';

interface SlotProposal {item:SessionView;slotId:string|null;start:string;end:string;offset:string}
export class FormationSessions extends LitElement {
 static properties={formation:{state:true},items:{state:true},selected:{state:true},busy:{state:true},error:{state:true},notice:{state:true},fields:{state:true},pending:{state:true},editingSlot:{state:true}};
 declare private formation:FormationView|null;
 declare private items:SessionSummary[];
 declare private selected:SessionView|null;
 declare private busy:boolean;
 declare private error:string;
 declare private notice:string;
 declare private fields:Record<string,string>;
 declare private pending:{proposal:SlotProposal;conflicts:string[]}|null;
 declare private editingSlot:string|null;
 constructor(){super();this.formation=null;this.items=[];this.selected=null;this.busy=false;this.error='';this.notice='';this.fields={};this.pending=null;this.editingSlot=null;}
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
  this.formation=formation;this.selected=null;this.pending=null;this.editingSlot=null;this.items=[];this.notice='';this.error='';this.fields={};
  await this.updateComplete;this.renderRoot.querySelector<HTMLFormElement>('#session-create')?.reset();this.dialog().showModal();await this.load();await this.focusElement('button[autofocus]');
 }
 private async perform(work:()=>Promise<void>,success?:string){
  if(this.busy)return;const generation=++this.generation;this.busy=true;this.error='';this.fields={};this.notice='';
  try{await work();if(generation===this.generation&&success!==undefined)this.notice=success;}
  catch(error){if(generation===this.generation){this.error=error instanceof Error?error.message:messages.network;this.fields=error instanceof SessionError?error.fields:{};await this.focusElement('#session-error');}}
  finally{if(generation===this.generation)this.busy=false;}
 }
 private async load(){await this.perform(async()=>{this.items=await sessionsApi.list(this.formation!.id);});}
 private changed(){this.dispatchEvent(new CustomEvent('sessions-changed',{bubbles:true,composed:true}));}
 private async create(event:SubmitEvent){
  event.preventDefault();const form=event.currentTarget as HTMLFormElement;const values=new FormData(form);const capacity=String(values.get('capacity')).trim();
  await this.perform(async()=>{const created=await sessionsApi.create(this.formation!.id,{title:String(values.get('title')),capacity:capacity?Number(capacity):null,modalities:String(values.get('modalities'))});this.selected=await sessionsApi.get(created.id);form.reset();this.changed();await this.focusElement('#session-detail-title');},m.saved);
 }
 private async open(id:string){this.pending=null;this.editingSlot=null;await this.perform(async()=>{this.selected=await sessionsApi.get(id);await this.updateComplete;this.renderRoot.querySelector<HTMLFormElement>('#session-slot-form')?.reset();await this.focusElement('#session-detail-title');});}
 private async back(){this.selected=null;this.pending=null;this.editingSlot=null;await this.load();await this.focusElement('#session-list-title');}
 private async editSlot(slot:SessionView['slots'][number]){
  this.editingSlot=slot.id;this.error='';this.notice='';this.fields={};await this.updateComplete;
  const form=this.renderRoot.querySelector<HTMLFormElement>('#session-slot-form')!;
  (form.elements.namedItem('startsAt') as HTMLInputElement).value=slot.startInput;
  (form.elements.namedItem('endsAt') as HTMLInputElement).value=slot.endInput;
  (form.elements.namedItem('offset') as HTMLInputElement).value='Z';
  await this.focusElement('#session-startsAt');
 }
 private async cancelEdit(){this.editingSlot=null;await this.updateComplete;this.renderRoot.querySelector<HTMLFormElement>('#session-slot-form')?.reset();await this.focusElement('#session-startsAt');}
 private async addSlot(event:SubmitEvent){
  event.preventDefault();const values=new FormData(event.currentTarget as HTMLFormElement);
  await this.saveSlot({item:this.selected!,slotId:this.editingSlot,start:String(values.get('startsAt')),end:String(values.get('endsAt')),offset:String(values.get('offset'))});
 }
 private async saveSlot(proposal:SlotProposal,confirm=false){
  await this.perform(async()=>{
   try{
    if(proposal.slotId)await sessionsApi.editSlot(proposal.item,proposal.slotId,proposal.start,proposal.end,proposal.offset,confirm);
    else await sessionsApi.addSlot(proposal.item,proposal.start,proposal.end,proposal.offset,confirm);
   }catch(error){
    if(error instanceof SessionError&&error.conflicts.length){this.pending={proposal,conflicts:error.conflicts};await this.focusElement('#session-conflicts');return;}
    throw error;
   }
   this.pending=null;this.editingSlot=null;this.selected=await sessionsApi.get(proposal.item.id);
   await this.updateComplete;this.renderRoot.querySelector<HTMLFormElement>('#session-slot-form')?.reset();this.changed();this.notice=proposal.slotId?m.slotUpdated:m.slotSaved;await this.focusElement('#session-detail-title');
  });
 }
 private async confirmSlot(){if(!this.pending||this.busy)return;const proposal=this.pending.proposal;this.pending=null;await this.saveSlot(proposal,true);}
 private async cancelConflict(){this.pending=null;await this.focusElement('#session-startsAt');}
 private async plan(){const item=this.selected!;await this.perform(async()=>{await sessionsApi.plan(item);this.selected=await sessionsApi.get(item.id);this.changed();await this.focusElement('#session-detail-title');},m.planned);}
 private field(name:string,label:string,type='text',required=false,help=''){
  const error=this.fields[name];const described=[help,error?`${name}-error`:''].filter(Boolean).join(' ');
  return html`<div class="form-field"><label for=${`session-${name}`}>${label}</label><input id=${`session-${name}`} name=${name} type=${type} ?required=${required} min=${type==='number'?'1':nothing} max=${type==='number'?'2147483647':nothing} step=${type==='number'?'1':type==='datetime-local'?'any':nothing} maxlength=${name==='title'?200:nothing} aria-invalid=${error?'true':'false'} aria-describedby=${described||nothing}>${error?html`<p class="field-error" id=${`${name}-error`}>${error}</p>`:nothing}</div>`;
 }
 render(){const item=this.selected;const editable=item?.state==='BROUILLON'||item?.state==='PLANIFIEE';return html`<dialog aria-labelledby="session-list-title" @cancel=${(event:Event)=>{if(this.busy)event.preventDefault();}}>
  <h2 id="session-list-title" tabindex="-1">${m.title} — ${this.formation?.title}</h2>
  <button type="button" ?disabled=${this.busy} @click=${()=>this.dialog().close()} autofocus>${m.close}</button>
  <p role="status" aria-label=${m.status}>${this.busy?m.loading:this.notice}</p>
  ${this.error?html`<p id="session-error" role="alert" tabindex="-1">${this.error}</p><button type="button" ?disabled=${this.busy} @click=${()=>item?this.open(item.id):this.load()}>${m.refresh}</button>`:nothing}
  ${item?html`<h3 id="session-detail-title" tabindex="-1">${item.title} — ${item.status}</h3><p>${item.capacityLabel}</p><p>${item.modalities}</p>
   ${item.instructors.length?html`<section aria-label=${m.assignedInstructors}><h4>${m.assignedInstructors}</h4><ul>${item.instructors.map(instructor=>html`<li>${instructor.label} — ${instructor.status}</li>`)}</ul></section>`:html`<p>${m.noAssignedInstructor}</p>`}
   ${item.slots.length?html`<ol aria-label=${m.slotsTitle}>${item.slots.map(slot=>html`<li>${slot.start} — ${slot.end}${editable?html` <button type="button" ?disabled=${this.busy||!!this.pending} aria-label=${`${m.editSlot} : ${slot.start}`} @click=${()=>this.editSlot(slot)}>${m.editSlot}</button>`:nothing}</li>`)}</ol>`:html`<p>${m.noSlots}</p>`}
   ${editable?html`<p id="session-time-help">${m.timeHelp}</p><form id="session-slot-form" aria-labelledby="session-slot-title" @submit=${this.addSlot}><fieldset ?disabled=${this.busy||!!this.pending}><legend id="session-slot-title">${this.editingSlot?m.editTitle:m.slot}</legend>
    ${this.field('startsAt',m.start,'datetime-local',true,'session-time-help')}${this.field('endsAt',m.end,'datetime-local',true,'session-time-help')}
    <div class="form-field"><label for="session-offset">${m.offset}</label><input id="session-offset" name="offset" value="Z" required pattern="Z|[+][0-9]{2}:[0-9]{2}|-[0-9]{2}:[0-9]{2}" aria-describedby="session-time-help"></div><button type="submit">${this.editingSlot?m.saveSlot:m.slot}</button>${this.editingSlot?html`<button type="button" @click=${this.cancelEdit}>${m.cancelSlot}</button>`:nothing}
   </fieldset></form>`:nothing}
   ${this.pending?html`<div id="session-conflicts" role="alert" tabindex="-1"><h3>${m.conflictTitle}</h3><p>${m.conflictCount(this.pending.conflicts.length)}</p><p>${m.conflictHelp}</p><p>${this.pending.proposal.start} ${this.pending.proposal.offset} → ${this.pending.proposal.end} ${this.pending.proposal.offset}</p></div><div class="actions"><button type="button" ?disabled=${this.busy} @click=${this.confirmSlot}>${m.confirmSlot}</button><button type="button" ?disabled=${this.busy} @click=${this.cancelConflict}>${m.cancelConflict}</button></div>`:nothing}
   ${item.state==='BROUILLON'?html`<p>${m.noInstructor}</p><button type="button" ?disabled=${this.busy||!!this.pending} @click=${this.plan}>${m.plan}</button>`:nothing}
   <div class="actions"><button type="button" ?disabled=${this.busy||!!this.pending} @click=${this.back}>${m.back}</button><button type="button" ?disabled=${this.busy} @click=${()=>this.open(item.id)}>${m.refresh}</button></div>
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
