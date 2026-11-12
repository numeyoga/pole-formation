import { LitElement,html,css,nothing,type PropertyValues } from 'lit';
import { formationsApi } from '../adapters/formations-api';
import type { ExplanationPage } from '../presentation/models';
import { ApiError } from '../../../shared/http/session';
import { messages,explanationMessages as m } from '../../../shared/i18n/fr';

/** Profile requirements: a formationId shows common ones; omitting it shows uncovered needs. */
export class MatchRequirements extends LitElement {
  static properties={profileId:{type:String},formationId:{type:String},formationLabel:{type:String},data:{state:true},busy:{state:true},error:{state:true}};
  declare profileId:string;declare formationId:string;declare formationLabel:string;
  declare data:ExplanationPage|null;declare busy:boolean;declare error:string;
  private generation=0;
  private requestedPage=0;
  constructor(){super();this.profileId='';this.formationId='';this.formationLabel='';this.data=null;this.busy=false;this.error='';}
  static styles=css`
    :host{display:block;margin-block:var(--space-small);overflow-wrap:anywhere;}
    *{box-sizing:border-box;}
    summary{cursor:pointer;min-block-size:var(--control-height);padding-block:var(--space-small);}
    h4{font-size:var(--text-base);margin-block:var(--space-small);}
    p{margin-block:var(--space-small);}
    ul{padding-inline-start:var(--space-section);}li{margin-block:var(--space-normal);}
    nav{display:flex;flex-wrap:wrap;gap:var(--space-small);align-items:center;}
    button{font:inherit;min-block-size:var(--control-height);max-inline-size:100%;padding:var(--space-control);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);color:var(--color-primary);background:var(--color-surface);cursor:pointer;}
    button:enabled:hover{color:var(--color-hover);text-decoration:underline;}
    button:disabled{opacity:var(--disabled-opacity);cursor:default;}
    :focus-visible{outline:var(--focus-width) solid var(--color-focus);outline-offset:var(--focus-width);}
    [role=alert]{color:var(--color-danger);}
  `;
  protected updated(changed:PropertyValues){
    if(changed.has('profileId')||changed.has('formationId')){
      this.generation++;this.data=null;this.busy=false;this.error='';
      const details=this.renderRoot.querySelector('details');if(details)details.open=false;
    }
  }
  disconnectedCallback(){super.disconnectedCallback();this.generation++;}
  private toggle(event:Event){
    if((event.currentTarget as HTMLDetailsElement).open)void this.load();
    else{this.generation++;this.data=null;this.busy=false;this.error='';}
  }
  private async load(page=0,focus=false){
    const generation=++this.generation;this.requestedPage=page;this.data=null;this.busy=true;this.error='';
    try{
      const data=await (this.formationId?formationsApi.commonRequirements(this.profileId,this.formationId,page):formationsApi.uncoveredRequirements(this.profileId,page));
      if(generation!==this.generation)return;
      if(page>0&&data.total>0&&!data.items.length){
        await this.load(Math.max(0,Math.ceil(data.total/data.size)-1),true);return;
      }
      this.data=data;
      if(focus){await this.updateComplete;if(generation===this.generation)this.renderRoot.querySelector<HTMLElement>('#explanation-title')?.focus();}
    }catch(error){if(generation===this.generation)this.error=error instanceof ApiError?error.message:messages.network;}
    finally{if(generation===this.generation)this.busy=false;}
  }
  render(){return html`
    <details @toggle=${this.toggle}>
      <summary>${this.formationId?m.forFormation(this.formationLabel):m.uncovered}</summary>
      <h4 id="explanation-title" tabindex="-1">${this.formationId?m.common:m.uncovered}</h4>
      <p>${this.formationId?m.help:m.uncoveredHelp}</p>
      <button type="button" ?disabled=${this.busy} @click=${()=>this.load(this.data?.page??0)}>${m.refresh}</button>
      ${this.busy?html`<progress aria-label=${m.loading}></progress>`:nothing}
      <p role="status">${this.data?m.count(this.data.total):''}</p>
      ${this.error?html`<p role="alert">${this.error}</p><button type="button" @click=${()=>this.load(this.requestedPage)}>${m.retry}</button>`:nothing}
      ${this.data&&!this.data.items.length?html`<p>${m.empty}</p>`:nothing}
      ${this.data?.items.length?html`<ul>${this.data.items.map(item=>html`<li><strong>${item.code} — ${item.label}</strong>${item.competencyStatus?html`<p>${item.competencyStatus}</p>`:nothing}<p>${m.classification} : ${item.classification}</p></li>`)}</ul>`:nothing}
      ${this.data&&this.data.total>this.data.size?html`<nav aria-label=${m.pages}>
        <button type="button" ?disabled=${this.busy||this.data.page===0} @click=${()=>this.load(this.data!.page-1,true)}>${m.previous}</button>
        <span aria-current="page">Page ${this.data.page+1}</span>
        <button type="button" ?disabled=${this.busy||(this.data.page+1)*this.data.size>=this.data.total} @click=${()=>this.load(this.data!.page+1,true)}>${m.next}</button>
      </nav>`:nothing}
    </details>`;}
}
customElements.define('match-requirements',MatchRequirements);
