import {ApiError} from '../../../shared/http/session';
import {repeat} from 'lit/directives/repeat.js';
import {LitElement,css,html,nothing} from 'lit';
import {instructorsApi} from '../../instructors/adapters/instructors-api';
import type {InstructorPage} from '../../instructors/presentation/models';
import type {SessionView} from '../presentation/models';
import {sessionsApi,SessionError} from '../adapters/sessions-api';
import {assignmentMessages as m,messages} from '../../../shared/i18n/fr';

export class SessionInstructors extends LitElement {
 static properties={session:{attribute:false},choices:{state:true},selected:{state:true},busy:{state:true},error:{state:true},conflicts:{state:true},proposal:{state:true}};
 declare session:SessionView;
 declare private choices:InstructorPage|null;
 declare private selected:Map<string,string>;
 declare private busy:boolean;
 declare private error:string;
 declare private conflicts:string[];
 declare private proposal:{item:SessionView;ids:string[]}|null;
 private query='';private page=0;private generation=0;
 constructor(){super();this.choices=null;this.selected=new Map();this.busy=false;this.error='';this.conflicts=[];this.proposal=null;}
 static styles=css`
 :host{display:block;margin-block:var(--space-normal);}*{box-sizing:border-box;}
 form,fieldset{display:grid;gap:var(--space-small);}fieldset{border:0;padding:0;min-inline-size:0;}
 input,button{font:inherit;min-block-size:var(--control-height);padding:var(--space-control);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);background:var(--color-surface);color:var(--color-text);}
 input[type=search]{inline-size:100%;min-inline-size:0;}input[type=checkbox]{inline-size:auto;accent-color:var(--color-primary);}
 label{display:flex;align-items:center;gap:var(--space-small);overflow-wrap:anywhere;}button{cursor:pointer;color:var(--color-primary);}button:disabled{opacity:var(--disabled-opacity);}
 .actions{display:flex;flex-wrap:wrap;gap:var(--space-small);margin-block:var(--space-small);}
 :focus-visible{outline:var(--focus-width) solid var(--color-focus);outline-offset:var(--focus-width);}[role=alert]{color:var(--color-danger);}p,li{overflow-wrap:anywhere;}
 `;
 protected updated(changed:Map<PropertyKey,unknown>){if(changed.has('session')){this.selected=new Map(this.session.instructors.map(i=>[i.id,i.label]));this.proposal=null;this.conflicts=[];void this.load();}}
 disconnectedCallback(){super.disconnectedCallback();this.generation++;}
 private async focusElement(selector:string){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>(selector)?.focus();}
 private async load(){const generation=++this.generation;this.busy=true;this.error='';try{const result=await instructorsApi.list(this.query,true,this.page);if(generation===this.generation)this.choices=result;}catch(error){if(generation===this.generation){this.error=error instanceof ApiError?error.message:messages.network;await this.focusElement('[role=alert]');}}finally{if(generation===this.generation)this.busy=false;}}
 private toggle(id:string,label:string,checked:boolean){const selection=new Map(this.selected);if(checked)selection.set(id,label);else selection.delete(id);this.selected=selection;}
 private async save(confirm=false){
  if(this.busy)return;const proposal=this.proposal??{item:this.session,ids:[...this.selected.keys()]};this.busy=true;this.error='';
  try{await sessionsApi.assign(proposal.item,proposal.ids,confirm);this.proposal=null;this.conflicts=[];this.dispatchEvent(new CustomEvent('instructors-saved',{bubbles:true,composed:true}));}
  catch(error){if(error instanceof SessionError&&error.conflicts.length){this.proposal=proposal;this.conflicts=error.conflicts;}else{this.error=error instanceof ApiError?error.message:messages.network;this.proposal=null;this.conflicts=[];}await this.focusElement('[role=alert]');}
  finally{this.busy=false;}
 }
 render(){const locked=this.busy||!!this.proposal;return html`<section aria-labelledby="assign-title"><h4 id="assign-title">${m.title}</h4><p>${m.help}</p>
 <p aria-live="polite">${this.busy?m.loading:''}</p>${this.error?html`<p role="alert" tabindex="-1">${this.error}</p><button type="button" ?disabled=${this.busy} @click=${()=>this.load()}>${m.retry}</button>`:nothing}
 <search><form aria-label=${m.searchTitle} @submit=${(event:SubmitEvent)=>{event.preventDefault();this.query=String(new FormData(event.currentTarget as HTMLFormElement).get('q'));this.page=0;void this.load();}}><label for="instructor-q">${m.search}</label><input id="instructor-q" name="q" type="search" ?disabled=${locked}><button type="submit" ?disabled=${locked}>${m.searchButton}</button></form></search>
 <fieldset ?disabled=${locked}><legend>${m.selected}</legend>${this.selected.size?html`<ul>${[...this.selected].map(([id,label])=>html`<li>${label} <button type="button" aria-label=${`${m.remove} ${label}`} @click=${()=>this.toggle(id,label,false)}>${m.remove}</button></li>`)}</ul>`:html`<p>${m.emptySelection}</p>`}</fieldset>
 <fieldset ?disabled=${locked}><legend>${m.available}</legend>${this.choices?.items.length?repeat(this.choices.items,i=>i.id,i=>html`<label><input type="checkbox" .checked=${this.selected.has(i.id)} @change=${(event:Event)=>this.toggle(i.id,i.label,(event.target as HTMLInputElement).checked)}>${i.label}</label>`):html`<p>${m.empty}</p>`}</fieldset>
 ${this.choices?html`<nav aria-label=${m.pages} class="actions"><button type="button" ?disabled=${locked||this.page===0} @click=${()=>{this.page--;void this.load();}}>${m.previous}</button><button type="button" ?disabled=${locked||(this.page+1)*this.choices.size>=this.choices.total} @click=${()=>{this.page++;void this.load();}}>${m.next}</button></nav>`:nothing}
 <button type="button" ?disabled=${locked||!this.choices} @click=${()=>this.save()}>${m.save}</button>
 ${this.proposal?html`<p role="alert" tabindex="-1">${m.conflict(this.conflicts.length)}</p><div class="actions"><button type="button" ?disabled=${this.busy} @click=${()=>this.save(true)}>${m.confirm}</button><button type="button" ?disabled=${this.busy} @click=${async()=>{this.proposal=null;this.conflicts=[];await this.focusElement('#instructor-q');}}>${m.cancel}</button></div>`:nothing}
 </section>`;}
}
customElements.define('session-instructors',SessionInstructors);
