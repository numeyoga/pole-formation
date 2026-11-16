import {LitElement,css,html,nothing} from 'lit';
import {navigate} from '../../../app/navigation';
import {ApiError} from '../../../shared/http/session';
import {formationsApi} from '../adapters/formations-api';
import type {FormationView,FormationAction} from '../presentation/models';
import {messages,formationMessages as m} from '../../../shared/i18n/fr';
import './formation-competencies';
import '../../sessions/components/formation-sessions';

export class FormationDetail extends LitElement {
  static properties={entityId:{attribute:false},section:{type:String},saving:{type:Boolean},item:{state:true},loading:{state:true},error:{state:true}};
  declare entityId:string;
  declare section:string;
  declare saving:boolean;
  private declare item:FormationView|null;
  private declare loading:boolean;
  private declare error:string;
  private generation=0;
  private visited=new Set<string>();
  constructor(){super();this.entityId='';this.section='presentation';this.saving=false;this.item=null;this.loading=false;this.error='';}
  static styles=css`
    :host{display:block;}[hidden]{display:none;}h2{font-size:var(--text-section);margin:0;}h3{font-size:var(--text-base);}
    header{display:grid;gap:var(--space-small);margin-block:var(--space-normal);}p{overflow-wrap:anywhere;white-space:pre-wrap;}
    nav,.actions{display:flex;flex-wrap:wrap;gap:var(--space-small);margin-block:var(--space-normal);}
    a{color:var(--color-primary);}nav a,button{display:inline-flex;align-items:center;min-block-size:var(--control-height);padding:var(--space-control);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);font:inherit;}
    nav a[aria-current]{background:var(--color-primary);color:var(--color-surface);text-decoration:none;}
    button{background:var(--color-surface);color:var(--color-primary);cursor:pointer;}button:disabled{opacity:var(--disabled-opacity);}
    dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,var(--control-width)),1fr));gap:var(--space-normal);}
    dt{font-weight:var(--font-weight-strong);color:var(--color-muted);}dd{margin:0;overflow-wrap:anywhere;}
    :focus-visible{outline:var(--focus-width) solid var(--color-focus);outline-offset:var(--focus-width);}[role=alert]{color:var(--color-danger);}
  `;
  protected updated(changes:Map<PropertyKey,unknown>){
    if(changes.has('entityId')){this.item=null;this.visited.clear();void this.refresh();}
    if(changes.has('section'))this.visited.add(this.section||'presentation');
  }
  disconnectedCallback(){super.disconnectedCallback();this.generation++;}
  async focusHeading(){await this.updateComplete;if(this.checkVisibility())this.renderRoot.querySelector<HTMLElement>('#formation-detail-title')?.focus();}
  async refresh(focus=true){
    if(!this.entityId)return;
    const generation=++this.generation;const path=window.location.pathname;this.loading=true;this.error='';
    if(this.item?.id!==this.entityId)this.item=null;
    this.visited.add(this.section||'presentation');
    try{const item=await formationsApi.get(this.entityId);if(generation===this.generation){this.item=item;if(focus&&window.location.pathname===path)await this.focusHeading();}}
    catch(error){if(generation===this.generation){this.error=error instanceof Error?error.message:messages.network;if(error instanceof ApiError&&[401,403,404].includes(error.status))this.item=null;if(focus&&window.location.pathname===path)await this.focusHeading();}}
    finally{if(generation===this.generation)this.loading=false;}
  }
  private follow(event:MouseEvent){navigate(event);}
  private edit(){this.dispatchEvent(new CustomEvent('formation-edit',{detail:this.item,bubbles:true,composed:true}));}
  private transition(action:FormationAction){this.dispatchEvent(new CustomEvent('formation-transition',{detail:{item:this.item,action},bubbles:true,composed:true}));}
  render(){const item=this.item?.id===this.entityId?this.item:null;const current=this.section||'presentation';this.visited.add(current);return html`
    <a href="/catalogue" @click=${this.follow}>Retour au catalogue</a>
    <header><h2 id="formation-detail-title" tabindex="-1">${item?.title??'Fiche formation'}</h2>${item?html`<p>${item.code} · ${item.status}</p>`:nothing}</header>
    ${this.loading?html`<p role="status">Chargement de la formation…</p>`:nothing}
    ${this.error?html`<p role="alert">${this.error}</p><button type="button" @click=${()=>this.refresh()}>${m.reload}</button>`:nothing}
    ${item?html`
      <nav aria-label="Rubriques de la formation">${[['presentation','Présentation'],['competences','Compétences'],['sessions','Sessions']].map(([section,label])=>html`<a href=${`/catalogue/${this.entityId}/${section}`} aria-current=${current===section?'page':nothing} @click=${this.follow}>${label}</a>`)}</nav>
      <section ?hidden=${current!=='presentation'} ?inert=${current!=='presentation'} aria-label="Présentation de la formation">
        <dl><div><dt>Code</dt><dd>${item.code}</dd></div><div><dt>État</dt><dd>${item.status}</dd></div><div><dt>Durée indicative</dt><dd>${item.durationMinutes===null?'Non renseignée':`${item.durationMinutes} min`}</dd></div></dl>
        <h3>Objectifs</h3><p>${item.objectives||'Aucun objectif renseigné.'}</p><h3>Description</h3><p>${item.description||'Aucune description renseignée.'}</p>
        <div class="actions"><button type="button" ?disabled=${this.saving} @click=${this.edit}>${m.modify}</button>${item.state==='BROUILLON'?html`<button type="button" ?disabled=${this.saving} @click=${()=>this.transition('activation')}>${m.activate}</button>`:nothing}${item.state==='ARCHIVEE'?html`<button type="button" ?disabled=${this.saving} @click=${()=>this.transition('reactivation')}>${m.reactivate}</button>`:html`<button type="button" ?disabled=${this.saving} @click=${()=>this.transition('archivage')}>${m.archive}</button>`}</div>
      </section>
      ${this.visited.has('competences')?html`<div ?hidden=${current!=='competences'} ?inert=${current!=='competences'}><formation-competencies .inline=${true} .formation=${item}></formation-competencies></div>`:nothing}
      ${this.visited.has('sessions')?html`<div ?hidden=${current!=='sessions'} ?inert=${current!=='sessions'}><formation-sessions .inline=${true} .formation=${item}></formation-sessions></div>`:nothing}
    `:nothing}
  `;}
}
customElements.define('formation-detail',FormationDetail);
