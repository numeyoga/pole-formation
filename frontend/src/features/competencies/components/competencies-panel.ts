import { LitElement,html,css,nothing } from 'lit';
import { competenciesApi,CompetencyError } from '../adapters/competencies-api';
import type { CompetencyPage,CompetencyView,ParentOption } from '../presentation/models';
import { ApiError } from '../../../shared/http/session';
import { messages,competencyMessages as m } from '../../../shared/i18n/fr';

export class CompetenciesPanel extends LitElement {
  static properties={data:{state:true},busy:{state:true},error:{state:true},notice:{state:true},editing:{state:true},pending:{state:true},formError:{state:true},fields:{state:true},stale:{state:true},parentOptions:{state:true},filterParent:{state:true}};
  declare data:CompetencyPage|null;declare busy:boolean;declare error:string;
  declare notice:string;declare editing:CompetencyView|null;declare pending:CompetencyView|null;declare formError:string;declare fields:Record<string,string>;declare stale:boolean;
  declare parentOptions:ParentOption[];declare filterParent:string;
  private generation=0;
  constructor(){super();this.data=null;this.busy=false;this.error='';this.notice='';this.editing=null;this.pending=null;this.formError='';this.fields={};this.stale=false;this.parentOptions=[];this.filterParent='';}
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
    dialog{inline-size:var(--control-width);max-inline-size:calc(100% - var(--space-page));padding:var(--space-section);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);color:var(--color-text);background:var(--color-surface);}
  `;
  connectedCallback(){super.connectedCallback();void this.load();}
  disconnectedCallback(){super.disconnectedCallback();this.generation++;}
  async focusHeading(){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#competencies-title')?.focus();}
  private async load(page=0){
    const generation=++this.generation;this.busy=true;this.error='';
    try{const [data,parents]=await Promise.all([competenciesApi.list(page,this.filterParent||undefined),competenciesApi.parents()]);if(generation===this.generation){this.data=data;this.parentOptions=parents;}}
    catch(error){if(generation!==this.generation)return;this.error=error instanceof ApiError?error.message:messages.network;this.data=null;}
    finally{if(generation===this.generation)this.busy=false;}
  }
  private dialog(id:string){return this.renderRoot.querySelector<HTMLDialogElement>(id)!;}
  private message(error:unknown){return error instanceof ApiError?error.message:messages.network;}
  private async prepareForm(){
    await this.updateComplete;const form=this.renderRoot.querySelector<HTMLFormElement>('#competency-form')!;form.reset();
    (form.elements.namedItem('code') as HTMLInputElement).value=this.editing?.code??'';
    (form.elements.namedItem('label') as HTMLInputElement).value=this.editing?.label??'';
    const parent=form.elements.namedItem('subdomainId') as HTMLSelectElement|null;if(parent)parent.value=this.parentOptions.some(p=>p.id===this.filterParent&&p.selectableForCreation)?this.filterParent:'';
  }
  private async open(item:CompetencyView|null){this.editing=item;this.formError='';this.fields={};this.stale=false;this.notice='';await this.prepareForm();this.dialog('#competency-editor').showModal();}
  private async submit(event:SubmitEvent){
    event.preventDefault();if(this.busy)return;const values=new FormData(event.currentTarget as HTMLFormElement);this.busy=true;this.formError='';this.fields={};this.stale=false;
    try{
      if(this.editing)await competenciesApi.update(this.editing,String(values.get('code')),String(values.get('label')));
      else await competenciesApi.create(String(values.get('subdomainId')),String(values.get('code')),String(values.get('label')));
      this.dialog('#competency-editor').close();await this.load();this.notice=m.saved;await this.focusHeading();
    }catch(error){this.formError=this.message(error);this.fields=error instanceof CompetencyError?error.fields:{};this.stale=!!this.editing&&error instanceof CompetencyError&&error.status===409&&!Object.keys(error.fields).length;await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#competency-form-error')?.focus();}
    finally{this.busy=false;}
  }
  private async reloadEditing(){
    if(!this.editing)return;this.busy=true;let loaded=false;
    try{this.editing=await competenciesApi.get(this.editing.id);this.formError='';this.fields={};this.stale=false;await this.prepareForm();loaded=true;}
    catch(error){this.formError=this.message(error);}finally{this.busy=false;}
    if(loaded){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#competency-code')?.focus();}
  }
  private async confirm(item:CompetencyView){this.pending=item;this.formError='';this.notice='';await this.updateComplete;this.dialog('#competency-disable').showModal();}
  private async reloadPending(){if(!this.pending)return;this.busy=true;try{this.pending=await competenciesApi.get(this.pending.id);this.formError='';}catch(error){this.formError=this.message(error);}finally{this.busy=false;}}
  private async deactivate(){
    if(!this.pending||this.busy)return;this.busy=true;this.formError='';
    try{await competenciesApi.deactivate(this.pending);this.dialog('#competency-disable').close();await this.load(this.data?.page??0);this.notice=m.disabled;await this.focusHeading();}
    catch(error){this.formError=this.message(error);await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#competency-disable-error')?.focus();}finally{this.busy=false;}
  }
  render(){return html`<section aria-labelledby="competencies-title"><header><h2 id="competencies-title" tabindex="-1">${m.title}</h2><button type="button" ?disabled=${this.busy} @click=${()=>this.open(null)}>${m.create}</button><button type="button" ?disabled=${this.busy} @click=${()=>this.load(this.data?.page??0)}>${m.refresh}</button></header>
    <label for="competency-filter">${m.filter}</label><select id="competency-filter" .value=${this.filterParent} ?disabled=${this.busy} @change=${(event:Event)=>{this.filterParent=(event.target as HTMLSelectElement).value;this.notice='';void this.load();}}><option value="">${m.allParents}</option>${this.parentOptions.map(p=>html`<option value=${p.id}>${p.label}</option>`)}</select>
    ${this.error?html`<p role="alert">${this.error}</p>`:nothing}
    <p role="status" aria-label=${m.status}>${this.busy?m.loading:this.notice|| (this.data?`${this.data.total} compétence(s).`:'')}</p>
    ${this.data&&!this.data.items.length?html`<p>${m.empty}</p>`:nothing}
    ${this.data?.items.length?html`<div class="table-container" tabindex="0" role="region" aria-label=${m.table}><table><caption>${m.caption}</caption><thead><tr><th scope="col">${m.code}</th><th scope="col">${m.labelColumn}</th><th scope="col">${m.statusColumn}</th><th scope="col">${m.parent}</th><th scope="col">${m.parentStatusColumn}</th><th scope="col">${m.actions}</th></tr></thead><tbody>${this.data.items.map(item=>html`<tr><td>${item.code}</td><td>${item.label}</td><td>${item.status}</td><td>${item.parentCode} — ${item.parentLabel}</td><td>${item.parentStatus}</td><td><div class="actions"><button type="button" ?disabled=${this.busy} aria-label=${`${m.modify} ${item.label}`} @click=${()=>this.open(item)}>${m.modify}</button><button type="button" ?disabled=${this.busy||!item.active} aria-label=${`${m.deactivate} ${item.label}`} @click=${()=>this.confirm(item)}>${m.deactivate}</button></div></td></tr>`)}</tbody></table></div>`:nothing}
    ${this.data&&this.data.total>this.data.size?html`<nav aria-label=${m.pagination}><button ?disabled=${this.busy||this.data.page===0} @click=${()=>this.load(this.data!.page-1)}>${m.previous}</button><span>Page ${this.data.page+1}</span><button ?disabled=${this.busy||(this.data.page+1)*this.data.size>=this.data.total} @click=${()=>this.load(this.data!.page+1)}>${m.next}</button></nav>`:nothing}
  </section>
  <dialog id="competency-editor" aria-labelledby="competency-editor-title" @cancel=${(event:Event)=>{if(this.busy)event.preventDefault();}}><h2 id="competency-editor-title">${this.editing?m.edit:m.create}</h2><p role="status" aria-label=${m.formStatus}>${this.busy?m.saving:''}</p>
    ${this.formError?html`<p id="competency-form-error" role="alert" tabindex="-1">${this.formError}</p>`:nothing}${this.stale?html`<button type="button" ?disabled=${this.busy} @click=${this.reloadEditing}>${m.reload}</button>`:nothing}
    <form id="competency-form" @submit=${this.submit}><fieldset ?disabled=${this.busy}>
      ${this.editing?html`<p>${m.parent} : ${this.editing.parentCode} — ${this.editing.parentLabel}. ${m.fixedParent}</p>`:html`<label for="competency-parent">${m.parent}</label><select id="competency-parent" name="subdomainId" required aria-invalid=${this.fields.subdomainId?'true':'false'} aria-describedby="competency-parent-help"><option value="">${m.chooseParent}</option>${this.parentOptions.map(p=>html`<option value=${p.id} ?disabled=${!p.selectableForCreation}>${p.label}</option>`)}</select><p id="competency-parent-help">${m.parentHelp}${this.fields.subdomainId?` ${this.fields.subdomainId}`:''}</p>`}
      <label for="competency-code">${m.code}</label><input id="competency-code" name="code" required maxlength="64" autocomplete="off" aria-invalid=${this.fields.code?'true':'false'} aria-describedby=${this.fields.code?'competency-code-help competency-code-error':'competency-code-help'}><p id="competency-code-help">${m.codeHelp}</p>${this.fields.code?html`<p class="field-error" id="competency-code-error">${this.fields.code}</p>`:nothing}
      <label for="competency-label">${m.label}</label><input id="competency-label" name="label" required maxlength="200" aria-invalid=${this.fields.label?'true':'false'} aria-describedby=${this.fields.label?'competency-label-error':nothing}>${this.fields.label?html`<p class="field-error" id="competency-label-error">${this.fields.label}</p>`:nothing}
      <div class="actions"><button type="button" @click=${()=>this.dialog('#competency-editor').close()}>${messages.cancel}</button><button type="submit">${m.save}</button></div>
    </fieldset></form>
  </dialog>
  <dialog id="competency-disable" aria-labelledby="competency-disable-title" @cancel=${(event:Event)=>{if(this.busy)event.preventDefault();}}><h2 id="competency-disable-title">${m.disable}</h2><p>${this.pending?.label}</p><p>${m.disableHelp}</p><p role="status" aria-label=${m.disableStatus}>${this.busy?m.disabling:''}</p>${this.formError?html`<p id="competency-disable-error" role="alert" tabindex="-1">${this.formError}</p><button type="button" ?disabled=${this.busy} @click=${this.reloadPending}>${m.reloadCompetency}</button>`:nothing}<div class="actions"><button type="button" ?disabled=${this.busy} @click=${()=>this.dialog('#competency-disable').close()} autofocus>${messages.cancel}</button><button type="button" ?disabled=${this.busy} @click=${this.deactivate}>${m.confirmDisable}</button></div></dialog>`;}
}
customElements.define('competencies-panel',CompetenciesPanel);
