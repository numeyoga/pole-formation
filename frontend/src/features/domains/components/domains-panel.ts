import { LitElement,html,css,nothing } from 'lit';
import { domainsApi,DomainError } from '../adapters/domains-api';
import type { DomainView,DomainPage,ChildView } from '../presentation/models';
import { ApiError } from '../../../shared/http/session';
import { messages } from '../../../shared/i18n/fr';

interface ChildrenState {busy:boolean;items:ChildView[];error:string}
export class DomainsPanel extends LitElement {
  static properties={data:{state:true},busy:{state:true},error:{state:true},notice:{state:true},editing:{state:true},pending:{state:true},formError:{state:true},fields:{state:true},childViews:{state:true},stale:{state:true}};
  declare data:DomainPage|null;
  declare busy:boolean;declare error:string;declare notice:string;
  declare editing:DomainView|null;declare pending:DomainView|null;
  declare formError:string;declare fields:Record<string,string>;declare childViews:Record<string,ChildrenState>;declare stale:boolean;
  private generation=0;
  constructor(){super();this.data=null;this.busy=false;this.error='';this.notice='';this.editing=null;this.pending=null;this.formError='';this.fields={};this.childViews={};this.stale=false;}
  static styles=css`
    :host{display:block;margin-block-start:var(--space-section);padding:var(--space-section);background:var(--color-surface);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);}
    *{box-sizing:border-box;}h2{font-size:var(--text-section);margin:0;}p{margin-block:var(--space-small);}
    header,.actions,nav{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-small);}
    form,fieldset,label{display:grid;gap:var(--space-small);}fieldset{border:0;padding:0;margin:0;}
    input,button{font:inherit;min-block-size:var(--control-height);padding:var(--space-control);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);}
    input{max-inline-size:100%;color:var(--color-text);background:var(--color-surface);}
    button{inline-size:fit-content;max-inline-size:100%;color:var(--color-primary);background:var(--color-surface);cursor:pointer;}
    button:hover{color:var(--color-hover);text-decoration:underline;}button:disabled{opacity:var(--disabled-opacity);cursor:default;}
    [aria-invalid=true]{border-color:var(--color-danger);}[role=alert],.field-error{color:var(--color-danger);}
    [role=status]{color:var(--color-success);}
    :focus-visible{outline:var(--focus-width) solid var(--color-focus);outline-offset:var(--focus-width);}
    .table-container{overflow:auto;margin-block:var(--space-normal);}table{inline-size:100%;min-inline-size:var(--table-min-width);border-collapse:collapse;}
    caption{text-align:start;padding-block:var(--space-small);}th,td{text-align:start;vertical-align:top;padding:var(--space-control);border-block-end:var(--border-width) solid var(--color-border);overflow-wrap:anywhere;}
    td:nth-child(3){white-space:nowrap;}
    summary{cursor:pointer;min-block-size:var(--control-height);padding-block:var(--space-small);}
    dialog{inline-size:var(--control-width);max-inline-size:calc(100% - var(--space-page));padding:var(--space-section);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);color:var(--color-text);background:var(--color-surface);}
  `;
  connectedCallback(){super.connectedCallback();void this.load();}
  disconnectedCallback(){super.disconnectedCallback();this.generation++;}
  async focusHeading(){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#domains-title')?.focus();}
  private message(error:unknown){return error instanceof ApiError?error.message:messages.network;}
  private async load(page=0){
    const generation=++this.generation;this.busy=true;this.error='';this.childViews={};
    try{const data=await domainsApi.list(page);if(generation===this.generation){this.data=data;await this.updateComplete;for(const details of this.renderRoot.querySelectorAll<HTMLDetailsElement>('details[open]'))details.open=false;}}
    catch(error){if(generation!==this.generation)return;this.error=this.message(error);if(error instanceof ApiError && [401,403].includes(error.status))this.data=null;}
    finally{if(generation===this.generation)this.busy=false;}
  }
  private dialog(id:string){return this.renderRoot.querySelector<HTMLDialogElement>(id)!;}
  private async prepareForm(){
    await this.updateComplete;const form=this.renderRoot.querySelector<HTMLFormElement>('#domain-form')!;form.reset();
    (form.elements.namedItem('code') as HTMLInputElement).value=this.editing?.code??'';
    (form.elements.namedItem('label') as HTMLInputElement).value=this.editing?.label??'';
  }
  private async open(domain:DomainView|null){
    this.editing=domain;this.formError='';this.fields={};this.stale=false;this.notice='';
    await this.prepareForm();this.dialog('#domain-editor').showModal();
  }
  private async submit(event:SubmitEvent){
    event.preventDefault();if(this.busy)return;
    const data=new FormData(event.currentTarget as HTMLFormElement);this.busy=true;this.formError='';this.fields={};this.stale=false;
    try{
      if(this.editing)await domainsApi.update(this.editing,String(data.get('code')),String(data.get('label')));
      else await domainsApi.create(String(data.get('code')),String(data.get('label')));
      this.dialog('#domain-editor').close();await this.load();this.notice='Domaine enregistré.';
      await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#domains-title')?.focus();
    }catch(error){
      this.formError=this.message(error);this.fields=error instanceof DomainError?error.fields:{};
      this.stale=error instanceof DomainError && error.status===409 && !Object.keys(error.fields).length;
      await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#domain-form-error')?.focus();
    }finally{this.busy=false;}
  }
  private async reloadEditing(){
    if(!this.editing)return;this.busy=true;let loaded=false;
    try{this.editing=await domainsApi.get(this.editing.id);this.formError='';this.fields={};this.stale=false;await this.prepareForm();loaded=true;}
    catch(error){this.formError=this.message(error);}finally{this.busy=false;}
    if(loaded){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#domain-code')?.focus();}
  }
  private async confirm(domain:DomainView){this.pending=domain;this.formError='';this.notice='';await this.updateComplete;this.dialog('#domain-disable').showModal();}
  private async deactivate(){
    if(!this.pending || this.busy)return;this.busy=true;this.formError='';
    try{await domainsApi.deactivate(this.pending);this.dialog('#domain-disable').close();await this.load(this.data?.page??0);this.notice='Domaine désactivé. Les sous-domaines existants sont conservés.';
      await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#domains-title')?.focus();}
    catch(error){this.formError=this.message(error);await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#disable-error')?.focus();}
    finally{this.busy=false;}
  }
  private async showChildren(event:Event,domain:DomainView){
    if(!(event.currentTarget as HTMLDetailsElement).open || this.childViews[domain.id])return;
    await this.loadChildren(domain);
  }
  private async loadChildren(domain:DomainView){
    const generation=this.generation;this.childViews={...this.childViews,[domain.id]:{busy:true,items:[],error:''}};
    try{const items=await domainsApi.children(domain.id);if(generation===this.generation)this.childViews={...this.childViews,[domain.id]:{busy:false,items,error:''}};}
    catch(error){if(generation===this.generation)this.childViews={...this.childViews,[domain.id]:{busy:false,items:[],error:this.message(error)}};}
  }
  render(){return html`
    <section aria-labelledby="domains-title"><header><h2 id="domains-title" tabindex="-1">Domaines de compétences</h2><button ?disabled=${this.busy} @click=${()=>this.open(null)}>Créer un domaine</button><button ?disabled=${this.busy} @click=${()=>this.load(this.data?.page??0)}>Actualiser les domaines</button></header>
      ${this.error?html`<p role="alert">${this.error}</p>`:nothing}
      <p role="status" aria-label="État des domaines">${this.busy?'Chargement des domaines…':this.notice}</p>
      ${this.data&&!this.data.items.length?html`<p>Aucun domaine. Créez le premier domaine pour structurer le référentiel.</p>`:nothing}
      ${this.data?.items.length?html`<div class="table-container" tabindex="0" role="region" aria-label="Tableau des domaines"><table><caption>Domaines actifs et désactivés</caption><thead><tr><th scope="col">Code</th><th scope="col">Libellé</th><th scope="col">Statut</th><th scope="col">Actions et historique</th></tr></thead><tbody>${this.data.items.map(domain=>html`<tr><td>${domain.code}</td><td>${domain.label}</td><td>${domain.status}</td><td><div class="actions"><button ?disabled=${this.busy} aria-label=${`Modifier ${domain.label}`} @click=${()=>this.open(domain)}>Modifier</button><button ?disabled=${this.busy||!domain.active} aria-label=${`Désactiver ${domain.label}`} @click=${()=>this.confirm(domain)}>Désactiver</button></div>
        <details @toggle=${(event:Event)=>this.showChildren(event,domain)}><summary>Sous-domaines de ${domain.label}</summary>${this.childViews[domain.id]?.busy?html`<p role="status">Chargement des sous-domaines…</p>`:this.childViews[domain.id]?.error?html`<p role="alert">${this.childViews[domain.id].error}</p><button @click=${()=>this.loadChildren(domain)}>Réessayer les sous-domaines</button>`:this.childViews[domain.id]?.items.length?html`<ul>${this.childViews[domain.id].items.map(child=>html`<li>${child.label}</li>`)}</ul>`:html`<p>Aucun sous-domaine.</p>`}</details>
      </td></tr>`)}</tbody></table></div>`:nothing}
      ${this.data&&this.data.total>this.data.size?html`<nav aria-label="Pagination des domaines"><button ?disabled=${this.busy||this.data.page===0} @click=${()=>this.load(this.data!.page-1)}>Domaines précédents</button><span>Page ${this.data.page+1}</span><button ?disabled=${this.busy||(this.data.page+1)*this.data.size>=this.data.total} @click=${()=>this.load(this.data!.page+1)}>Domaines suivants</button></nav>`:nothing}
    </section>
    <dialog id="domain-editor" aria-labelledby="domain-editor-title" @cancel=${(event:Event)=>{if(this.busy)event.preventDefault();}}><h2 id="domain-editor-title">${this.editing?'Modifier un domaine':'Créer un domaine'}</h2><p role="status" aria-label="État du formulaire de domaine">${this.busy?'Enregistrement en cours…':''}</p>
      ${this.formError?html`<p id="domain-form-error" role="alert" tabindex="-1">${this.formError}</p>`:nothing}
      ${this.stale?html`<button ?disabled=${this.busy} @click=${this.reloadEditing}>Recharger la fiche</button>`:nothing}
      <form id="domain-form" @submit=${this.submit}><fieldset ?disabled=${this.busy}><label for="domain-code">Code</label><input id="domain-code" name="code" required maxlength="64" autocomplete="off" aria-invalid=${this.fields.code?'true':'false'} aria-describedby=${this.fields.code?'code-help code-error':'code-help'}><p id="code-help">64 caractères maximum. Le code reste réservé après désactivation.</p>${this.fields.code?html`<p class="field-error" id="code-error">${this.fields.code}</p>`:nothing}
        <label for="domain-label">Libellé</label><input id="domain-label" name="label" required maxlength="200" aria-invalid=${this.fields.label?'true':'false'} aria-describedby=${this.fields.label?'label-error':nothing}>${this.fields.label?html`<p class="field-error" id="label-error">${this.fields.label}</p>`:nothing}
        <div class="actions"><button type="button" @click=${()=>this.dialog('#domain-editor').close()}>Annuler</button><button>Enregistrer le domaine</button></div>
      </fieldset></form>
    </dialog>
    <dialog id="domain-disable" aria-labelledby="disable-title" @cancel=${(event:Event)=>{if(this.busy)event.preventDefault();}}><h2 id="disable-title">Désactiver un domaine</h2><p>${this.pending?.label}</p><p>Les sous-domaines existants restent consultables. Aucun nouveau rattachement ne sera possible.</p><p role="status" aria-label="État de la désactivation">${this.busy?'Désactivation en cours…':''}</p>${this.formError?html`<p id="disable-error" role="alert" tabindex="-1">${this.formError}</p>`:nothing}<div class="actions"><button ?disabled=${this.busy} @click=${()=>this.dialog('#domain-disable').close()} autofocus>Annuler</button><button ?disabled=${this.busy} @click=${this.deactivate}>Confirmer la désactivation</button></div></dialog>
  `;}
}
customElements.define('domains-panel',DomainsPanel);
