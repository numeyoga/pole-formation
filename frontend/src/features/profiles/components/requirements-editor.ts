import { LitElement,html,css,nothing } from 'lit';
import { profilesApi,ProfileError } from '../adapters/profiles-api';
import type { ProfileView,RequirementView,RequirementChoices } from '../presentation/models';
import { ApiError } from '../../../shared/http/session';
import { messages,requirementMessages as m } from '../../../shared/i18n/fr';

export class RequirementsEditor extends LitElement {
  static properties={profile:{state:true},requirement:{state:true},competencies:{state:true},classifications:{state:true},loading:{state:true},saving:{state:true},error:{state:true},stale:{state:true},fields:{state:true}};
  declare profile:ProfileView|null;declare requirement:RequirementView|null;
  declare competencies:RequirementChoices|null;declare classifications:RequirementChoices|null;
  declare loading:boolean;declare saving:boolean;declare error:string;declare stale:boolean;declare fields:Record<string,string>;
  private generation=0;private query='';
  constructor(){super();this.profile=null;this.requirement=null;this.competencies=null;this.classifications=null;this.loading=false;this.saving=false;this.error='';this.stale=false;this.fields={};}
  static styles=css`
    *{box-sizing:border-box;}dialog{inline-size:var(--control-width);max-inline-size:calc(100% - var(--space-page));max-block-size:calc(100% - var(--space-page));overflow:auto;padding:var(--space-section);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);color:var(--color-text);background:var(--color-surface);}
    h2{font-size:var(--text-section);margin:0;}p{margin-block:var(--space-small);overflow-wrap:anywhere;}
    form,fieldset,label{display:grid;gap:var(--space-small);}fieldset{border:0;padding:0;margin:0;min-inline-size:0;}
    .actions,nav{display:flex;flex-wrap:wrap;gap:var(--space-small);align-items:center;margin-block:var(--space-small);}
    input,select,button{font:inherit;min-block-size:var(--control-height);padding:var(--space-control);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);max-inline-size:100%;}
    input,select{inline-size:100%;min-inline-size:0;color:var(--color-text);background:var(--color-surface);}
    button{inline-size:fit-content;color:var(--color-primary);background:var(--color-surface);cursor:pointer;}button:disabled{opacity:var(--disabled-opacity);cursor:default;}
    [role=alert]{color:var(--color-danger);}[aria-invalid=true]{border-color:var(--color-danger);}
    :focus-visible{outline:var(--focus-width) solid var(--color-focus);outline-offset:var(--focus-width);}
  `;
  disconnectedCallback(){super.disconnectedCallback();this.generation++;}
  private dialog(){return this.renderRoot.querySelector<HTMLDialogElement>('dialog')!;}
  private message(error:unknown){return error instanceof ApiError?error.message:messages.network;}
  async show(profile:ProfileView,requirement:RequirementView|null=null){
    this.profile=profile;this.requirement=requirement;this.competencies=null;this.classifications=null;this.error='';this.fields={};this.stale=false;this.query='';
    await this.updateComplete;this.renderRoot.querySelectorAll<HTMLFormElement>('form').forEach(form=>form.reset());this.dialog().showModal();
    await this.loadChoices();
  }
  private async loadChoices(competencyPage=0,classificationPage=0){
    const generation=++this.generation;this.loading=true;this.error='';
    // Remove previous choices before a failing reload can leave stale selections enabled.
    this.competencies=null;this.classifications=null;
    try{
      const [competencies,classifications]=await Promise.all([this.requirement?Promise.resolve(null):profilesApi.competencyChoices(this.query,competencyPage),profilesApi.classificationChoices(classificationPage)]);
      if(generation!==this.generation)return;
      this.competencies=competencies;this.classifications=classifications;
    }catch(error){if(generation===this.generation)this.error=this.message(error);}
    finally{if(generation===this.generation)this.loading=false;}
  }
  private async reload(){
    if(!this.profile)return;
    if(!this.stale){await this.loadChoices();return;}
    const generation=++this.generation;const profileId=this.profile.id;const requirementId=this.requirement?.id;this.loading=true;this.error='';
    try{
      const items=await profilesApi.children(profileId);
      if(generation!==this.generation)return;
      const current=items.find(item=>item.id===requirementId);
      if(!current)throw new ProfileError(404,m.missing);
      this.requirement=current;this.stale=false;await this.loadChoices();
    }catch(error){if(generation===this.generation){this.error=this.message(error);this.loading=false;}}
  }
  private async search(event:SubmitEvent){event.preventDefault();if(this.loading||this.saving)return;this.query=String(new FormData(event.currentTarget as HTMLFormElement).get('q'));await this.loadChoices();}
  private async submit(event:SubmitEvent){
    event.preventDefault();if(this.loading||this.saving||this.stale||!this.profile)return;
    const data=new FormData(event.currentTarget as HTMLFormElement);this.saving=true;this.error='';this.fields={};
    try{
      if(this.requirement)await profilesApi.reclassify(this.profile.id,this.requirement,String(data.get('classificationId')));
      else await profilesApi.addRequirement(this.profile.id,String(data.get('competencyId')),String(data.get('classificationId')));
      this.dialog().close();this.dispatchEvent(new CustomEvent('requirement-saved',{detail:{profile:this.profile},bubbles:true,composed:true}));
    }catch(error){
      this.error=this.message(error);this.fields=error instanceof ProfileError?error.fields:{};this.stale=!!this.requirement&&error instanceof ApiError&&error.status===409;
      await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#requirement-error')?.focus();
    }finally{this.saving=false;}
  }
  private pagination(kind:'competency'|'classification',page:RequirementChoices|null){
    if(!page||page.total<=page.size)return nothing;
    return html`<nav aria-label=${kind==='competency'?m.competencyPages:m.classificationPages}><button type="button" ?disabled=${this.loading||this.saving||page.page===0} @click=${()=>this.loadChoices(kind==='competency'?page.page-1:this.competencies?.page??0,kind==='classification'?page.page-1:this.classifications?.page??0)}>${m.previous}</button><span aria-current="page">Page ${page.page+1}</span><button type="button" ?disabled=${this.loading||this.saving||(page.page+1)*page.size>=page.total} @click=${()=>this.loadChoices(kind==='competency'?page.page+1:this.competencies?.page??0,kind==='classification'?page.page+1:this.classifications?.page??0)}>${m.next}</button></nav>`;
  }
  render(){return html`<dialog aria-labelledby="requirement-title" @close=${()=>{this.generation++;this.loading=false;}} @cancel=${(event:Event)=>{if(this.saving)event.preventDefault();}}>
    <h2 id="requirement-title" tabindex="-1" autofocus>${this.requirement?m.reclassify:m.add}</h2><p>${this.profile?.label}</p>
    <p role="status" aria-label=${m.status}>${this.loading?m.loading:this.saving?m.saving:''}</p>
    ${this.error?html`<p id="requirement-error" role="alert" tabindex="-1">${this.error}</p><button type="button" ?disabled=${this.loading||this.saving} @click=${this.reload}>${m.reload}</button>`:nothing}
    ${this.requirement?html`<p>${this.requirement.competencyLabel} — ${m.current} ${this.requirement.classificationLabel}</p>`:html`<form @submit=${this.search}><label>${m.search}<input name="q" maxlength="200" ?disabled=${this.loading||this.saving}></label><button type="submit" ?disabled=${this.loading||this.saving}>${m.searchButton}</button></form>`}
    <form @submit=${this.submit}><fieldset ?disabled=${this.loading||this.saving||this.stale}>
      ${!this.requirement?html`<label for="requirement-competency">${m.competency}</label><select id="requirement-competency" name="competencyId" required aria-invalid=${this.fields.competencyId?'true':'false'} aria-describedby=${this.fields.competencyId?'requirement-error':nothing}><option value="">${m.chooseCompetency}</option>${this.competencies?.items.map(item=>html`<option value=${item.id}>${item.label}</option>`)}</select>${this.competencies&&!this.competencies.items.length?html`<p>${m.noCompetencies}</p>`:nothing}${this.pagination('competency',this.competencies)}`:nothing}
      <label for="requirement-classification">${m.classification}</label><select id="requirement-classification" name="classificationId" required aria-invalid=${this.fields.classificationId?'true':'false'} aria-describedby=${this.fields.classificationId?'requirement-error':nothing}><option value="">${m.chooseClassification}</option>${this.classifications?.items.map(item=>html`<option value=${item.id}>${item.label}</option>`)}</select>
      ${this.classifications&&!this.classifications.items.length?html`<p>${m.noClassifications}</p>`:nothing}${this.pagination('classification',this.classifications)}
      <p>${m.activeHelp}</p><button type="submit" ?disabled=${!this.classifications?.items.length||(!this.requirement&&!this.competencies?.items.length)}>${m.save}</button>
    </fieldset></form>
    <div class="actions"><button type="button" ?disabled=${this.saving} @click=${()=>this.dialog().close()}>${m.cancel}</button></div>
  </dialog>`;}
}
customElements.define('requirements-editor',RequirementsEditor);
