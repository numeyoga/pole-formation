import { LitElement,html,css,nothing } from 'lit';
import { subdomainsApi,SubdomainError } from '../adapters/subdomains-api';
import type { SubdomainPage,SubdomainView,ParentOption,CompetencyView } from '../presentation/models';
import { ApiError } from '../../../shared/http/session';
import { messages,subdomainMessages as m } from '../../../shared/i18n/fr';

interface CompetenciesState {busy:boolean;items:CompetencyView[];error:string}
export class SubdomainsPanel extends LitElement {
  static properties={data:{state:true},busy:{state:true},error:{state:true},notice:{state:true},editing:{state:true},pending:{state:true},formError:{state:true},fields:{state:true},stale:{state:true},parentOptions:{state:true},filterParent:{state:true},competencyViews:{state:true}};
  declare data:SubdomainPage|null;declare busy:boolean;declare error:string;
  declare notice:string;declare editing:SubdomainView|null;declare pending:SubdomainView|null;declare formError:string;declare fields:Record<string,string>;declare stale:boolean;
  declare parentOptions:ParentOption[];declare filterParent:string;declare competencyViews:Record<string,CompetenciesState>;
  private generation=0;
  constructor(){super();this.data=null;this.busy=false;this.error='';this.notice='';this.editing=null;this.pending=null;this.formError='';this.fields={};this.stale=false;this.parentOptions=[];this.filterParent='';this.competencyViews={};}
  static styles=css`
    :host{display:block;margin-block-start:var(--space-section);padding:var(--space-section);background:var(--color-surface);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);}
    *{box-sizing:border-box;}h2{font-size:var(--text-section);margin:0;}p{margin-block:var(--space-small);}
    header,nav,.actions{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-small);}
    form,fieldset,label{display:grid;gap:var(--space-small);}fieldset{border:0;padding:0;margin:0;}
    input,select,button{font:inherit;min-block-size:var(--control-height);padding:var(--space-control);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);max-inline-size:100%;color:var(--color-text);background:var(--color-surface);}
    select{inline-size:100%;}button{inline-size:fit-content;color:var(--color-primary);cursor:pointer;}
    button:where(:enabled):hover{color:var(--color-hover);text-decoration:underline;}button:disabled{opacity:var(--disabled-opacity);cursor:default;}
    [role=alert],.field-error{color:var(--color-danger);}[aria-invalid=true]{border-color:var(--color-danger);}
    :focus-visible{outline:var(--focus-width) solid var(--color-focus);outline-offset:var(--focus-width);}
    .table-container{overflow:auto;margin-block:var(--space-normal);}table{inline-size:100%;min-inline-size:var(--table-min-width);border-collapse:collapse;}
    caption{text-align:start;padding-block:var(--space-small);}th,td{text-align:start;vertical-align:top;padding:var(--space-control);border-block-end:var(--border-width) solid var(--color-border);overflow-wrap:anywhere;}
    summary{cursor:pointer;min-block-size:var(--control-height);padding-block:var(--space-small);}
    dialog{inline-size:var(--control-width);max-inline-size:calc(100% - var(--space-page));padding:var(--space-section);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);color:var(--color-text);background:var(--color-surface);}
  `;
  connectedCallback(){super.connectedCallback();void this.load();}
  disconnectedCallback(){super.disconnectedCallback();this.generation++;}
  async focusHeading(){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#subdomains-title')?.focus();}
  private async load(page=0){
    const generation=++this.generation;this.busy=true;this.error='';this.competencyViews={};
    try{const [data,parents]=await Promise.all([subdomainsApi.list(page,this.filterParent||undefined),subdomainsApi.parents()]);if(generation===this.generation){this.data=data;this.parentOptions=parents;await this.updateComplete;for(const details of this.renderRoot.querySelectorAll<HTMLDetailsElement>('details[open]'))details.open=false;}}
    catch(error){if(generation!==this.generation)return;this.error=error instanceof ApiError?error.message:messages.network;this.data=null;}
    finally{if(generation===this.generation)this.busy=false;}
  }
  private dialog(id:string){return this.renderRoot.querySelector<HTMLDialogElement>(id)!;}
  private message(error:unknown){return error instanceof ApiError?error.message:messages.network;}
  private async prepareForm(){
    await this.updateComplete;const form=this.renderRoot.querySelector<HTMLFormElement>('#subdomain-form')!;form.reset();
    (form.elements.namedItem('code') as HTMLInputElement).value=this.editing?.code??'';
    (form.elements.namedItem('label') as HTMLInputElement).value=this.editing?.label??'';
    const parent=form.elements.namedItem('domainId') as HTMLSelectElement|null;if(parent)parent.value=this.parentOptions.some(p=>p.id===this.filterParent&&p.selectableForCreation)?this.filterParent:'';
  }
  private async open(item:SubdomainView|null){this.editing=item;this.formError='';this.fields={};this.stale=false;this.notice='';await this.prepareForm();this.dialog('#subdomain-editor').showModal();}
  private async submit(event:SubmitEvent){
    event.preventDefault();if(this.busy)return;const values=new FormData(event.currentTarget as HTMLFormElement);this.busy=true;this.formError='';this.fields={};this.stale=false;
    try{
      if(this.editing)await subdomainsApi.update(this.editing,String(values.get('code')),String(values.get('label')));
      else await subdomainsApi.create(String(values.get('domainId')),String(values.get('code')),String(values.get('label')));
      this.dialog('#subdomain-editor').close();await this.load();this.notice='Sous-domaine enregistré.';await this.focusHeading();
    }catch(error){this.formError=this.message(error);this.fields=error instanceof SubdomainError?error.fields:{};this.stale=!!this.editing&&error instanceof SubdomainError&&error.status===409&&!Object.keys(error.fields).length;await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#subdomain-form-error')?.focus();}
    finally{this.busy=false;}
  }
  private async reloadEditing(){
    if(!this.editing)return;this.busy=true;let loaded=false;
    try{this.editing=await subdomainsApi.get(this.editing.id);this.formError='';this.fields={};this.stale=false;await this.prepareForm();loaded=true;}
    catch(error){this.formError=this.message(error);}finally{this.busy=false;}
    if(loaded){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#subdomain-code')?.focus();}
  }
  private async confirm(item:SubdomainView){this.pending=item;this.formError='';this.notice='';await this.updateComplete;this.dialog('#subdomain-disable').showModal();}
  private async reloadPending(){if(!this.pending)return;this.busy=true;try{this.pending=await subdomainsApi.get(this.pending.id);this.formError='';}catch(error){this.formError=this.message(error);}finally{this.busy=false;}}
  private async deactivate(){
    if(!this.pending||this.busy)return;this.busy=true;this.formError='';
    try{await subdomainsApi.deactivate(this.pending);this.dialog('#subdomain-disable').close();await this.load(this.data?.page??0);this.notice='Sous-domaine désactivé. Les compétences et liens existants sont conservés.';await this.focusHeading();}
    catch(error){this.formError=this.message(error);await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#subdomain-disable-error')?.focus();}finally{this.busy=false;}
  }
  private async loadCompetencies(item:SubdomainView){
    const generation=this.generation;this.competencyViews={...this.competencyViews,[item.id]:{busy:true,items:[],error:''}};
    try{const items=await subdomainsApi.competencies(item.id);if(generation===this.generation)this.competencyViews={...this.competencyViews,[item.id]:{busy:false,items,error:''}};}
    catch(error){if(generation===this.generation)this.competencyViews={...this.competencyViews,[item.id]:{busy:false,items:[],error:this.message(error)}};}
  }
  private async showCompetencies(event:Event,item:SubdomainView){if((event.currentTarget as HTMLDetailsElement).open&&!this.competencyViews[item.id])await this.loadCompetencies(item);}
  render(){return html`<section aria-labelledby="subdomains-title"><header><h2 id="subdomains-title" tabindex="-1">${m.title}</h2><button type="button" ?disabled=${this.busy} @click=${()=>this.open(null)}>Créer un sous-domaine</button><button type="button" ?disabled=${this.busy} @click=${()=>this.load(this.data?.page??0)}>${m.refresh}</button></header>
    <label for="subdomain-filter">Filtrer par domaine parent</label><select id="subdomain-filter" .value=${this.filterParent} ?disabled=${this.busy} @change=${(event:Event)=>{this.filterParent=(event.target as HTMLSelectElement).value;this.notice='';void this.load();}}><option value="">Tous les domaines</option>${this.parentOptions.map(p=>html`<option value=${p.id}>${p.label}</option>`)}</select>
    ${this.error?html`<p role="alert">${this.error}</p>`:nothing}
    <p role="status" aria-label=${m.status}>${this.busy?m.loading:this.notice|| (this.data?`${this.data.total} sous-domaine(s).`:'')}</p>
    ${this.data&&!this.data.items.length?html`<p>${m.empty}</p>`:nothing}
    ${this.data?.items.length?html`<div class="table-container" tabindex="0" role="region" aria-label=${m.table}><table><caption>${m.caption}</caption><thead><tr><th scope="col">Code</th><th scope="col">Libellé du sous-domaine</th><th scope="col">Statut du sous-domaine</th><th scope="col">Domaine parent</th><th scope="col">Statut du domaine parent</th><th scope="col">Actions et historique</th></tr></thead><tbody>${this.data.items.map(item=>html`<tr><td>${item.code}</td><td>${item.label}</td><td>${item.status}</td><td>${item.parentCode} — ${item.parentLabel}</td><td>${item.parentStatus}</td><td><div class="actions"><button type="button" ?disabled=${this.busy} aria-label=${`Modifier ${item.label}`} @click=${()=>this.open(item)}>Modifier</button><button type="button" ?disabled=${this.busy||!item.active} aria-label=${`Désactiver ${item.label}`} @click=${()=>this.confirm(item)}>Désactiver</button></div><details @toggle=${(event:Event)=>this.showCompetencies(event,item)}><summary>Compétences de ${item.label}</summary>${this.competencyViews[item.id]?.busy?html`<p role="status">Chargement des compétences…</p>`:this.competencyViews[item.id]?.error?html`<p role="alert">${this.competencyViews[item.id].error}</p><button type="button" @click=${()=>this.loadCompetencies(item)}>Réessayer les compétences</button>`:this.competencyViews[item.id]?.items.length?html`<ul>${this.competencyViews[item.id].items.map(c=>html`<li>${c.label} — ${c.status}</li>`)}</ul>`:html`<p>Aucune compétence.</p>`}</details></td></tr>`)}</tbody></table></div>`:nothing}
    ${this.data&&this.data.total>this.data.size?html`<nav aria-label=${m.pagination}><button ?disabled=${this.busy||this.data.page===0} @click=${()=>this.load(this.data!.page-1)}>${m.previous}</button><span>Page ${this.data.page+1}</span><button ?disabled=${this.busy||(this.data.page+1)*this.data.size>=this.data.total} @click=${()=>this.load(this.data!.page+1)}>${m.next}</button></nav>`:nothing}
  </section>
  <dialog id="subdomain-editor" aria-labelledby="subdomain-editor-title" @cancel=${(event:Event)=>{if(this.busy)event.preventDefault();}}><h2 id="subdomain-editor-title">${this.editing?'Modifier un sous-domaine':'Créer un sous-domaine'}</h2><p role="status" aria-label="État du formulaire de sous-domaine">${this.busy?'Enregistrement en cours…':''}</p>
    ${this.formError?html`<p id="subdomain-form-error" role="alert" tabindex="-1">${this.formError}</p>`:nothing}${this.stale?html`<button type="button" ?disabled=${this.busy} @click=${this.reloadEditing}>Recharger la fiche</button>`:nothing}
    <form id="subdomain-form" @submit=${this.submit}><fieldset ?disabled=${this.busy}>
      ${this.editing?html`<p>Domaine parent : ${this.editing.parentCode} — ${this.editing.parentLabel}. Fixé à la création.</p>`:html`<label for="subdomain-parent">Domaine parent</label><select id="subdomain-parent" name="domainId" required aria-invalid=${this.fields.domainId?'true':'false'} aria-describedby="subdomain-parent-help"><option value="">Choisir un domaine actif</option>${this.parentOptions.map(p=>html`<option value=${p.id} ?disabled=${!p.selectableForCreation}>${p.label}</option>`)}</select><p id="subdomain-parent-help">Le domaine parent sera fixé à la création.${this.fields.domainId?` ${this.fields.domainId}`:''}</p>`}
      <label for="subdomain-code">Code</label><input id="subdomain-code" name="code" required maxlength="64" autocomplete="off" aria-invalid=${this.fields.code?'true':'false'} aria-describedby=${this.fields.code?'subdomain-code-help subdomain-code-error':'subdomain-code-help'}><p id="subdomain-code-help">64 caractères maximum. Le code est unique parmi tous les sous-domaines et reste réservé après désactivation.</p>${this.fields.code?html`<p class="field-error" id="subdomain-code-error">${this.fields.code}</p>`:nothing}
      <label for="subdomain-label">Libellé</label><input id="subdomain-label" name="label" required maxlength="200" aria-invalid=${this.fields.label?'true':'false'} aria-describedby=${this.fields.label?'subdomain-label-error':nothing}>${this.fields.label?html`<p class="field-error" id="subdomain-label-error">${this.fields.label}</p>`:nothing}
      <div class="actions"><button type="button" @click=${()=>this.dialog('#subdomain-editor').close()}>Annuler</button><button type="submit">Enregistrer le sous-domaine</button></div>
    </fieldset></form>
  </dialog>
  <dialog id="subdomain-disable" aria-labelledby="subdomain-disable-title" @cancel=${(event:Event)=>{if(this.busy)event.preventDefault();}}><h2 id="subdomain-disable-title">Désactiver un sous-domaine</h2><p>${this.pending?.label}</p><p>Les compétences et liens existants restent consultables. Aucun nouveau rattachement de compétence ne sera possible.</p><p role="status" aria-label="État de la désactivation du sous-domaine">${this.busy?'Désactivation en cours…':''}</p>${this.formError?html`<p id="subdomain-disable-error" role="alert" tabindex="-1">${this.formError}</p><button type="button" ?disabled=${this.busy} @click=${this.reloadPending}>Recharger le sous-domaine</button>`:nothing}<div class="actions"><button type="button" ?disabled=${this.busy} @click=${()=>this.dialog('#subdomain-disable').close()} autofocus>Annuler</button><button type="button" ?disabled=${this.busy} @click=${this.deactivate}>Confirmer la désactivation du sous-domaine</button></div></dialog>`;}
}
customElements.define('subdomains-panel',SubdomainsPanel);
