import {ApiError} from '../../../shared/http/session';
import {LitElement,css,html,nothing} from 'lit';
import {collaboratorsApi} from '../../collaborators/adapters/collaborators-api';
import type {CollaboratorPage} from '../../collaborators/presentation/models';
import type {ParticipantView} from '../../access/presentation/models';
import {participationsApi,ParticipationError} from '../adapters/participations-api';
import {messages,participationMessages as m} from '../../../shared/i18n/fr';
interface Proposal {session:string;collaborator?:string;participation?:string;state?:'INSCRITE'|'DESISTEE'}
export class SessionEnrollment extends LitElement {
 static properties={sessionId:{attribute:false},participants:{attribute:false},choices:{state:true},busy:{state:true},error:{state:true},notice:{state:true},pending:{state:true}};
 declare sessionId:string;declare participants:ParticipantView[];declare private choices:CollaboratorPage|null;
 declare private busy:boolean;declare private error:string;declare private notice:string;declare private pending:Proposal|null;
 private query='';private page=0;private generation=0;
 constructor(){super();this.participants=[];this.choices=null;this.busy=false;this.error='';this.notice='';this.pending=null;}
 static styles=css`
 :host{display:block;}*{box-sizing:border-box;}form,fieldset{display:grid;gap:var(--space-small);}fieldset{border:0;padding:0;min-inline-size:0;}
 input,select,button{font:inherit;min-block-size:var(--control-height);padding:var(--space-control);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);color:var(--color-text);background:var(--color-surface);max-inline-size:100%;}input,select{inline-size:100%;min-inline-size:0;}button{cursor:pointer;color:var(--color-primary);}button:disabled{opacity:var(--disabled-opacity);}
 .actions{display:flex;flex-wrap:wrap;gap:var(--space-small);margin-block:var(--space-small);}p,li{overflow-wrap:anywhere;}
 :focus-visible{outline:var(--focus-width) solid var(--color-focus);outline-offset:var(--focus-width);}[role=alert]{color:var(--color-danger);}
 `;
 protected updated(changed:Map<PropertyKey,unknown>){if(changed.has('sessionId')){this.pending=null;this.notice='';this.choices=null;void this.load();}}
 disconnectedCallback(){super.disconnectedCallback();this.generation++;}
 private async focusElement(selector:string){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>(selector)?.focus();}
 private async load(){const generation=++this.generation;this.busy=true;this.error='';try{const choices=await collaboratorsApi.list(this.query,true,this.page);if(generation===this.generation)this.choices=choices;}catch(error){if(generation===this.generation){this.error=error instanceof ApiError?error.message:messages.network;await this.focusElement('[role=alert]');}}finally{if(generation===this.generation)this.busy=false;}}
 private async save(proposal:Proposal,confirmed=false){
  if(this.busy)return;const generation=++this.generation;this.busy=true;this.error='';this.notice='';
  try{if(proposal.collaborator)await participationsApi.enroll(proposal.session,proposal.collaborator,confirmed);else await participationsApi.transition(proposal.session,proposal.participation!,proposal.state!,confirmed);
   if(generation===this.generation){this.pending=null;this.notice=m.saved;this.dispatchEvent(new CustomEvent('participations-changed',{bubbles:true,composed:true}));}}
  catch(error){if(generation===this.generation){if(error instanceof ParticipationError&&error.conflicts.length){this.pending=proposal;this.error=m.conflict(error.conflicts.length);}else{this.pending=null;this.error=error instanceof ApiError?error.message:messages.network;}await this.focusElement('[role=alert]');}}
  finally{if(generation===this.generation)this.busy=false;}
 }
 render(){const locked=this.busy||!!this.pending;return html`<section aria-labelledby="enrollment-title"><h3 id="enrollment-title">${m.title}</h3><p>${m.help}</p><p role="status" aria-label=${m.status}>${this.busy?m.loading:this.notice}</p>
 ${this.error?html`<p role="alert" tabindex="-1">${this.error}</p>${!this.pending?html`<button type="button" ?disabled=${this.busy} @click=${()=>this.load()}>${m.retry}</button>`:nothing}`:nothing}
 <search><form aria-label=${m.searchTitle} @submit=${(event:SubmitEvent)=>{event.preventDefault();this.query=String(new FormData(event.currentTarget as HTMLFormElement).get('q'));this.page=0;void this.load();}}><label for="enrollment-q">${m.search}</label><input id="enrollment-q" name="q" type="search" maxlength="200" ?disabled=${locked}><button type="submit" ?disabled=${locked}>${m.searchButton}</button></form></search>
 <form aria-label=${m.enroll} @submit=${(event:SubmitEvent)=>{event.preventDefault();void this.save({session:this.sessionId,collaborator:String(new FormData(event.currentTarget as HTMLFormElement).get('collaborator'))});}}><fieldset ?disabled=${locked}><legend>${m.enroll}</legend><label for="enrollment-choice">${m.choice}</label><select id="enrollment-choice" name="collaborator" required><option value="">${m.placeholder}</option>${this.choices?.items.map(c=>html`<option value=${c.id}>${c.label} — ${c.professionalId}</option>`)}</select><button type="submit">${m.enroll}</button></fieldset></form>
 ${this.choices?html`<nav class="actions" aria-label=${m.pages}><button type="button" ?disabled=${locked||this.page===0} @click=${()=>{this.page--;void this.load();}}>${m.previous}</button><button type="button" ?disabled=${locked||(this.page+1)*this.choices.size>=this.choices.total} @click=${()=>{this.page++;void this.load();}}>${m.next}</button></nav>${this.choices.total===0?html`<p>${m.empty}</p>`:nothing}`:nothing}
 <ul>${this.participants.filter(p=>p.state==='INSCRITE'||p.state==='DESISTEE').map(p=>html`<li>${p.name} — ${p.professionalId}<button type="button" ?disabled=${locked} aria-label=${`${p.state==='INSCRITE'?m.withdraw:m.reenroll} ${p.name}`} @click=${()=>this.save({session:this.sessionId,participation:p.id,state:p.state==='INSCRITE'?'DESISTEE':'INSCRITE'})}>${p.state==='INSCRITE'?m.withdraw:m.reenroll}</button></li>`)}</ul>
 ${this.pending?html`<div class="actions"><button type="button" ?disabled=${this.busy} @click=${()=>this.save(this.pending!,true)}>${m.confirm}</button><button type="button" ?disabled=${this.busy} @click=${async()=>{this.pending=null;this.error='';await this.focusElement('#enrollment-q');}}>${m.cancel}</button></div>`:nothing}
 </section>`;}
}
customElements.define('session-enrollment',SessionEnrollment);
