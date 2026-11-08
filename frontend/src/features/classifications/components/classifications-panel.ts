import { LitElement,html,css,nothing } from 'lit';
import { classificationsApi,ClassificationError } from '../adapters/classifications-api';
import type { ClassificationView,ClassificationPage } from '../presentation/models';
import { ApiError } from '../../../shared/http/session';
import { messages,classificationMessages as m } from '../../../shared/i18n/fr';

export class ClassificationsPanel extends LitElement {
  static properties={data:{state:true},busy:{state:true},error:{state:true},notice:{state:true},editing:{state:true},formError:{state:true},fields:{state:true},stale:{state:true}};
  declare data:ClassificationPage|null;
  declare busy:boolean;declare error:string;declare notice:string;
  declare editing:ClassificationView|null;
  declare formError:string;declare fields:Record<string,string>;declare stale:boolean;
  private generation=0;
  constructor(){super();this.data=null;this.busy=false;this.error='';this.notice='';this.editing=null;this.formError='';this.fields={};this.stale=false;}
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
    input[type=checkbox]{min-block-size:var(--control-height);accent-color:var(--color-primary);}
    dialog{inline-size:var(--control-width);max-inline-size:calc(100% - var(--space-page));padding:var(--space-section);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);color:var(--color-text);background:var(--color-surface);}
  `;
  connectedCallback(){super.connectedCallback();void this.load();}
  disconnectedCallback(){super.disconnectedCallback();this.generation++;}
  async focusHeading(){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#classifications-title')?.focus();}
  private message(error:unknown){return error instanceof ApiError?error.message:messages.network;}
  private async load(page=0){
    const generation=++this.generation;this.busy=true;this.error='';
    try{const data=await classificationsApi.list(page);if(generation===this.generation){this.data=data;}}
    catch(error){if(generation!==this.generation)return;this.error=this.message(error);if(error instanceof ApiError && [401,403].includes(error.status))this.data=null;}
    finally{if(generation===this.generation)this.busy=false;}
  }
  private dialog(id:string){return this.renderRoot.querySelector<HTMLDialogElement>(id)!;}
  private async prepareForm(){
    await this.updateComplete;const form=this.renderRoot.querySelector<HTMLFormElement>('#classification-form')!;form.reset();
    (form.elements.namedItem('code') as HTMLInputElement).value=this.editing?.code??'';
    (form.elements.namedItem('label') as HTMLInputElement).value=this.editing?.label??'';
    (form.elements.namedItem('sortOrder') as HTMLInputElement).value=String(this.editing?.sortOrder??0);
    const active=form.elements.namedItem('active') as HTMLInputElement|null;
    if(active)active.checked=this.editing?.active??true;
  }
  private async open(classification:ClassificationView|null){
    this.editing=classification;this.formError='';this.fields={};this.stale=false;this.notice='';
    await this.prepareForm();this.dialog('#classification-editor').showModal();
  }
  private async submit(event:SubmitEvent){
    event.preventDefault();if(this.busy)return;
    const data=new FormData(event.currentTarget as HTMLFormElement);this.busy=true;this.formError='';this.fields={};this.stale=false;
    try{
      if(this.editing)await classificationsApi.update({...this.editing,active:data.has('active')},String(data.get('code')),String(data.get('label')),Number(data.get('sortOrder')));
      else await classificationsApi.create(String(data.get('code')),String(data.get('label')),Number(data.get('sortOrder')));
      this.dialog('#classification-editor').close();await this.load();this.notice=m.saved;
      await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#classifications-title')?.focus();
    }catch(error){
      this.formError=this.message(error);this.fields=error instanceof ClassificationError?error.fields:{};
      this.stale=error instanceof ClassificationError && error.status===409 && !Object.keys(error.fields).length;
      await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#classification-form-error')?.focus();
    }finally{this.busy=false;}
  }
  private async reloadEditing(){
    if(!this.editing)return;this.busy=true;let loaded=false;
    try{this.editing=await classificationsApi.get(this.editing.id);this.formError='';this.fields={};this.stale=false;await this.prepareForm();loaded=true;}
    catch(error){this.formError=this.message(error);}finally{this.busy=false;}
    if(loaded){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#classification-code')?.focus();}
  }
  render(){return html`
    <section aria-labelledby="classifications-title"><header><h2 id="classifications-title" tabindex="-1">${m.title}</h2><button ?disabled=${this.busy} @click=${()=>this.open(null)}>${m.create}</button><button ?disabled=${this.busy} @click=${()=>this.load(this.data?.page??0)}>${m.refresh}</button></header>
      ${this.error?html`<p role="alert">${this.error}</p>`:nothing}
      <p role="status" aria-label=${m.status}>${this.busy?m.loading:this.notice}</p>
      ${this.data&&!this.data.items.length?html`<p>${m.empty}</p>`:nothing}
      ${this.data?.items.length?html`<div class="table-container" tabindex="0" role="region" aria-label=${m.table}><table><caption>${m.caption}</caption><thead><tr><th scope="col">${m.code}</th><th scope="col">${m.label}</th><th scope="col">${m.order}</th><th scope="col">${m.state}</th><th scope="col">${m.actions}</th></tr></thead><tbody>${this.data.items.map(classification=>html`<tr><td>${classification.code}</td><td>${classification.label}</td><td>${classification.sortOrder}</td><td>${classification.status}</td><td><div class="actions"><button ?disabled=${this.busy} aria-label=${`${m.modify} ${classification.label}`} @click=${()=>this.open(classification)}>${m.modify}</button></div>

      </td></tr>`)}</tbody></table></div>`:nothing}
      ${this.data&&this.data.total>this.data.size?html`<nav aria-label=${m.pagination}><button ?disabled=${this.busy||this.data.page===0} @click=${()=>this.load(this.data!.page-1)}>${m.previous}</button><span aria-current="page">Page ${this.data.page+1}</span><button ?disabled=${this.busy||(this.data.page+1)*this.data.size>=this.data.total} @click=${()=>this.load(this.data!.page+1)}>${m.next}</button></nav>`:nothing}
    </section>
    <dialog id="classification-editor" aria-labelledby="classification-editor-title" @cancel=${(event:Event)=>{if(this.busy)event.preventDefault();}}><h2 id="classification-editor-title">${this.editing?m.edit:m.create}</h2><p role="status" aria-label=${m.formStatus}>${this.busy?m.saving:''}</p>
      ${this.formError?html`<p id="classification-form-error" role="alert" tabindex="-1">${this.formError}</p>`:nothing}
      ${this.stale?html`<button ?disabled=${this.busy} @click=${this.reloadEditing}>${m.reload}</button>`:nothing}
      <form id="classification-form" @submit=${this.submit}><fieldset ?disabled=${this.busy}><label for="classification-code">${m.code}</label><input id="classification-code" name="code" required maxlength="64" autocomplete="off" aria-invalid=${this.fields.code?'true':'false'} aria-describedby=${this.fields.code?'code-help code-error':'code-help'}><p id="code-help">${m.codeHelp}</p>${this.fields.code?html`<p class="field-error" id="code-error">${this.fields.code}</p>`:nothing}
        <label for="classification-label">${m.label}</label><input id="classification-label" name="label" required maxlength="200" aria-invalid=${this.fields.label?'true':'false'} aria-describedby=${this.fields.label?'label-error':nothing}>${this.fields.label?html`<p class="field-error" id="label-error">${this.fields.label}</p>`:nothing}
        <label for="classification-order">${m.order}</label><input id="classification-order" name="sortOrder" type="number" min="0" max="2147483647" step="1" required aria-invalid=${this.fields.sortOrder?'true':'false'} aria-describedby=${this.fields.sortOrder?'order-error':nothing}>${this.fields.sortOrder?html`<p class="field-error" id="order-error">${this.fields.sortOrder}</p>`:nothing}
        ${this.editing?html`<label for="classification-active"><input id="classification-active" name="active" type="checkbox">${m.active}</label><p>${m.activationHelp}</p>`:nothing}
        <div class="actions"><button type="button" @click=${()=>this.dialog('#classification-editor').close()}>${m.cancel}</button><button type="submit">${m.save}</button></div>
      </fieldset></form>
    </dialog>

  `;}
}
customElements.define('classifications-panel',ClassificationsPanel);
