import { LitElement,html,css,nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { formationsApi } from '../adapters/formations-api';
import type { FormationView,CoveragePage,CompetencyChoices } from '../presentation/models';
import { ApiError } from '../../../shared/http/session';
import { messages,coverageMessages as m } from '../../../shared/i18n/fr';

export class FormationCompetencies extends LitElement {
  static properties={formation:{state:true},coverage:{state:true},choices:{state:true},loading:{state:true},saving:{state:true},error:{state:true},notice:{state:true}};
  declare formation:FormationView|null;declare coverage:CoveragePage|null;declare choices:CompetencyChoices|null;
  declare loading:boolean;declare saving:boolean;declare error:string;declare notice:string;
  private query='';private generation=0;
  constructor(){super();this.formation=null;this.coverage=null;this.choices=null;this.loading=false;this.saving=false;this.error='';this.notice='';}
  static styles=css`
    *{box-sizing:border-box;}h2{font-size:var(--text-section);margin:0;}p{margin-block:var(--space-small);}
    dialog{max-block-size:calc(100% - var(--space-page));overflow:auto;inline-size:var(--control-width);max-inline-size:calc(100% - var(--space-page));padding:var(--space-section);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);color:var(--color-text);background:var(--color-surface);}
    section{margin-block:var(--space-section);}section+section{border-block-start:var(--border-width) solid var(--color-border);padding-block-start:var(--space-section);}h3{font-size:inherit;margin-block:var(--space-small);}
    .choices{list-style:none;padding:0;margin:0;}.choice{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:var(--space-small);min-block-size:var(--control-height);padding-block:var(--space-small);border-block-end:var(--border-width) solid var(--color-border);cursor:pointer;}.choice span{overflow-wrap:anywhere;}.choice input{inline-size:auto;margin:0;accent-color:var(--color-primary);}
    form,fieldset,label{display:grid;gap:var(--space-small);}fieldset{border:0;padding:0;margin:0;min-inline-size:0;}form,nav{margin-block:var(--space-normal);}
    input:not([type=radio]),button{font:inherit;min-block-size:var(--control-height);padding:var(--space-control);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);max-inline-size:100%;}
    input:not([type=radio]){min-inline-size:0;inline-size:100%;color:var(--color-text);background:var(--color-surface);}
    button{inline-size:fit-content;color:var(--color-primary);background:var(--color-surface);cursor:pointer;}button:where(:enabled):hover{color:var(--color-hover);text-decoration:underline;}button:disabled{opacity:var(--disabled-opacity);cursor:default;}
    nav,.actions{display:flex;flex-wrap:wrap;gap:var(--space-small);align-items:center;}li{overflow-wrap:anywhere;margin-block:var(--space-small);}
    [role=alert]{color:var(--color-danger);}[role=status]{color:var(--color-success);}
    :focus-visible{outline:var(--focus-width) solid var(--color-focus);outline-offset:var(--focus-width);}
  `;
  disconnectedCallback(){super.disconnectedCallback();this.generation++;}
  private dialog(){return this.renderRoot.querySelector<HTMLDialogElement>('dialog')!;}
  private message(error:unknown){return error instanceof ApiError?error.message:messages.network;}
  async show(formation:FormationView){
    this.formation=formation;this.query='';this.coverage=null;this.choices=null;this.error='';this.notice='';
    await this.updateComplete;this.renderRoot.querySelectorAll<HTMLFormElement>('form').forEach(form=>form.reset());this.dialog().showModal();
    await this.load();
  }
  private async load(coveragePage=0,choicePage=0){
    if(!this.formation)return;
    const generation=++this.generation;const id=this.formation.id;this.loading=true;this.error='';this.choices=null;
    try{
      const current=await formationsApi.get(id);
      const [coverage,choices]=await Promise.all([formationsApi.coverage(id,coveragePage),current.state==='ACTIVE'?formationsApi.competencyChoices(this.query,choicePage):Promise.resolve(null)]);
      if(generation!==this.generation)return;this.formation=current;this.coverage=coverage;this.choices=choices;
    }catch(error){if(generation===this.generation){this.error=this.message(error);this.coverage=null;}}
    finally{if(generation===this.generation)this.loading=false;}
  }
  private async search(event:SubmitEvent){event.preventDefault();if(this.loading||this.saving)return;this.query=String(new FormData(event.currentTarget as HTMLFormElement).get('q'));this.notice='';await this.load(this.coverage?.page??0);}
  private async submit(event:SubmitEvent){
    event.preventDefault();if(!this.formation||this.loading||this.saving)return;
    const id=this.formation.id;const competencyId=String(new FormData(event.currentTarget as HTMLFormElement).get('competencyId'));
    this.saving=true;this.error='';this.notice='';
    try{
      await formationsApi.associate(id,competencyId);
      await this.load();
      this.notice=m.saved;this.dispatchEvent(new CustomEvent('coverage-saved',{bubbles:true,composed:true}));
    }catch(error){this.error=this.message(error);}
    finally{this.saving=false;}
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLElement>(this.error?'#coverage-error':'#coverage-title')?.focus();
  }
  private async changePage(kind:'coverage'|'choices',page:number){
    await this.load(kind==='coverage'?page:this.coverage?.page??0,kind==='choices'?page:this.choices?.page??0);
    await this.updateComplete;this.renderRoot.querySelector<HTMLElement>(this.error?'#coverage-error':kind==='choices'?'#available-title':'#associated-title')?.focus();
  }
  private pagination(kind:'coverage'|'choices',page:CoveragePage|CompetencyChoices|null){
    if(!page||page.total<=page.size)return nothing;
    return html`<nav aria-label=${kind==='coverage'?m.coveragePages:m.choicesPages}>
      <button type="button" ?disabled=${this.loading||this.saving||page.page===0} @click=${()=>this.changePage(kind,page.page-1)}>${m.previous}</button>
      <span aria-current="page">${m.page} ${page.page+1} ${m.of} ${Math.ceil(page.total/page.size)}</span>
      <button type="button" ?disabled=${this.loading||this.saving||(page.page+1)*page.size>=page.total} @click=${()=>this.changePage(kind,page.page+1)}>${m.next}</button>
    </nav>`;
  }
  render(){return html`<dialog aria-labelledby="coverage-title" @close=${()=>{this.generation++;this.loading=false;}} @cancel=${(event:Event)=>{if(this.saving)event.preventDefault();}}>
    <h2 id="coverage-title" tabindex="-1" autofocus>${m.title}</h2><p>${this.formation?.title}</p><p>${m.help}</p>
    <p role="status" aria-label=${m.status}>${this.loading?m.loading:this.saving?m.saving:this.notice}</p>
    ${this.error?html`<p id="coverage-error" role="alert" tabindex="-1">${this.error}</p><button type="button" ?disabled=${this.loading||this.saving} @click=${()=>this.load()}>${m.retry}</button>`:nothing}
    <section aria-labelledby="associated-title"><h3 id="associated-title" tabindex="-1">${m.associatedTitle}</h3>
      ${this.coverage?html`<p>${this.coverage.total} ${m.associatedCount}</p>${this.coverage.items.length?html`<ul>${this.coverage.items.map(item=>html`<li>${item.code} — ${item.label} — ${item.status}</li>`)}</ul>`:html`<p>${m.empty}</p>`}`:nothing}
      ${this.pagination('coverage',this.coverage)}
    </section>
    <p id="coverage-help">${m.activeHelp}</p>
    ${this.formation?.state==='ACTIVE'?html`<section aria-labelledby="available-title"><h3 id="available-title" tabindex="-1">${m.availableTitle}</h3>
      <form @submit=${this.search}><label>${m.search}<input type="search" name="q" maxlength="200" ?disabled=${this.loading||this.saving}></label><button type="submit" ?disabled=${this.loading||this.saving}>${m.searchButton}</button></form>
      ${this.choices?html`<p>${this.choices.total} ${m.availableCount}</p>`:nothing}
      <form @submit=${this.submit}><fieldset ?disabled=${this.loading||this.saving} aria-describedby="coverage-help"><legend>${m.choose}</legend>
        <ul class="choices">${repeat(this.choices?.items??[],item=>item.id,item=>html`<li><label class="choice"><input type="radio" name="competencyId" value=${item.id} required><span>${item.code} — ${item.label}</span></label></li>`)}</ul>
        ${this.choices&&!this.choices.items.length?html`<p>${m.noChoices}</p>`:nothing}
        ${this.pagination('choices',this.choices)}
        <button type="submit" ?disabled=${!this.choices?.items.length}>${m.add}</button>
      </fieldset></form>
    </section>`:nothing}
    <div class="actions"><button type="button" ?disabled=${this.loading||this.saving} @click=${()=>this.load(this.coverage?.page??0,this.choices?.page??0)}>${m.refresh}</button><button type="button" ?disabled=${this.saving} @click=${()=>this.dialog().close()}>${m.close}</button></div>
  </dialog>`;}
}
customElements.define('formation-competencies',FormationCompetencies);
