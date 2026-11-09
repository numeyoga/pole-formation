import { LitElement,html,css,nothing } from 'lit';
import { profilesApi,ProfileError } from '../adapters/profiles-api';
import type { ProfileView,ProfilePage,RequirementView } from '../presentation/models';
import './requirements-editor';
import type { RequirementsEditor } from './requirements-editor';
import { requirementMessages as r } from '../../../shared/i18n/fr';
import { ApiError } from '../../../shared/http/session';
import { messages,profileMessages as m } from '../../../shared/i18n/fr';

interface ChildrenState {busy:boolean;items:RequirementView[];error:string}
export class ProfilesPanel extends LitElement {
  static properties={data:{state:true},busy:{state:true},error:{state:true},notice:{state:true},editing:{state:true},pending:{state:true},formError:{state:true},fields:{state:true},childViews:{state:true},stale:{state:true}};
  declare data:ProfilePage|null;
  declare busy:boolean;declare error:string;declare notice:string;
  declare editing:ProfileView|null;declare pending:ProfileView|null;
  declare formError:string;declare fields:Record<string,string>;declare childViews:Record<string,ChildrenState>;declare stale:boolean;
  private generation=0;
  constructor(){super();this.data=null;this.busy=false;this.error='';this.notice='';this.editing=null;this.pending=null;this.formError='';this.fields={};this.childViews={};this.stale=false;}
  static styles=css`
    :host{display:block;margin-block-start:var(--space-section);padding:var(--space-section);background:var(--color-surface);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);}
    *{box-sizing:border-box;}h2{font-size:var(--text-section);margin:0;}p{margin-block:var(--space-small);}
    header,.actions,nav{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-small);}
    form,fieldset,label{display:grid;gap:var(--space-small);}fieldset{border:0;padding:0;margin:0;}
    input,textarea,button{font:inherit;min-block-size:var(--control-height);padding:var(--space-control);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);}
    input,textarea{max-inline-size:100%;color:var(--color-text);background:var(--color-surface);}
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
  async focusHeading(){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#profiles-title')?.focus();}
  private message(error:unknown){return error instanceof ApiError?error.message:messages.network;}
  private async load(page=0){
    const generation=++this.generation;this.busy=true;this.error='';this.childViews={};
    try{const data=await profilesApi.list(page);if(generation===this.generation){this.data=data;await this.updateComplete;for(const details of this.renderRoot.querySelectorAll<HTMLDetailsElement>('details[open]'))details.open=false;}}
    catch(error){if(generation!==this.generation)return;this.error=this.message(error);if(error instanceof ApiError && [401,403].includes(error.status))this.data=null;}
    finally{if(generation===this.generation)this.busy=false;}
  }
  private dialog(id:string){return this.renderRoot.querySelector<HTMLDialogElement>(id)!;}
  private async prepareForm(){
    await this.updateComplete;const form=this.renderRoot.querySelector<HTMLFormElement>('#profile-form')!;form.reset();
    (form.elements.namedItem('code') as HTMLInputElement).value=this.editing?.code??'';
    (form.elements.namedItem('label') as HTMLInputElement).value=this.editing?.label??'';
    (form.elements.namedItem('description') as HTMLTextAreaElement).value=this.editing?.description??'';
  }
  private async open(profile:ProfileView|null){
    this.editing=profile;this.formError='';this.fields={};this.stale=false;this.notice='';
    await this.prepareForm();this.dialog('#profile-editor').showModal();
  }
  private async submit(event:SubmitEvent){
    event.preventDefault();if(this.busy)return;
    const data=new FormData(event.currentTarget as HTMLFormElement);this.busy=true;this.formError='';this.fields={};this.stale=false;
    try{
      if(this.editing)await profilesApi.update(this.editing,String(data.get('code')),String(data.get('label')),String(data.get('description')));
      else await profilesApi.create(String(data.get('code')),String(data.get('label')),String(data.get('description')));
      this.dialog('#profile-editor').close();await this.load();this.notice=m.saved;
      await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#profiles-title')?.focus();
    }catch(error){
      this.formError=this.message(error);this.fields=error instanceof ProfileError?error.fields:{};
      this.stale=error instanceof ProfileError && error.status===409 && !Object.keys(error.fields).length;
      await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#profile-form-error')?.focus();
    }finally{this.busy=false;}
  }
  private async reloadEditing(){
    if(!this.editing)return;this.busy=true;let loaded=false;
    try{this.editing=await profilesApi.get(this.editing.id);this.formError='';this.fields={};this.stale=false;await this.prepareForm();loaded=true;}
    catch(error){this.formError=this.message(error);}finally{this.busy=false;}
    if(loaded){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#profile-code')?.focus();}
  }
  private async confirm(profile:ProfileView){this.pending=profile;this.formError='';this.notice='';await this.updateComplete;this.dialog('#profile-disable').showModal();}
  private async deactivate(){
    if(!this.pending || this.busy)return;this.busy=true;this.formError='';
    try{await profilesApi.deactivate(this.pending);this.dialog('#profile-disable').close();await this.load(this.data?.page??0);this.notice=m.disabled;
      await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#profiles-title')?.focus();}
    catch(error){this.formError=this.message(error);await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#disable-error')?.focus();}
    finally{this.busy=false;}
  }
  private async showChildren(event:Event,profile:ProfileView){
    if(!(event.currentTarget as HTMLDetailsElement).open || this.childViews[profile.id])return;
    await this.loadChildren(profile);
  }
  private async loadChildren(profile:ProfileView){
    const generation=this.generation;this.childViews={...this.childViews,[profile.id]:{busy:true,items:[],error:''}};
    try{const items=await profilesApi.children(profile.id);if(generation===this.generation)this.childViews={...this.childViews,[profile.id]:{busy:false,items,error:''}};}
    catch(error){if(generation===this.generation)this.childViews={...this.childViews,[profile.id]:{busy:false,items:[],error:this.message(error)}};}
  }
  private async requirementSaved(event:CustomEvent<{profile:ProfileView}>){
    await this.loadChildren(event.detail.profile);this.notice=r.saved;
    await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#profiles-title')?.focus();
  }
  private showRequirement(profile:ProfileView,requirement:RequirementView|null=null){void this.renderRoot.querySelector<RequirementsEditor>('requirements-editor')!.show(profile,requirement);}
  render(){return html`
    <section aria-labelledby="profiles-title"><header><h2 id="profiles-title" tabindex="-1">${m.title}</h2><button ?disabled=${this.busy} @click=${()=>this.open(null)}>${m.create}</button><button ?disabled=${this.busy} @click=${()=>this.load(this.data?.page??0)}>${m.refresh}</button></header>
      ${this.error?html`<p role="alert">${this.error}</p>`:nothing}
      <p role="status" aria-label=${m.status}>${this.busy?m.loading:this.notice}</p>
      ${this.data&&!this.data.items.length?html`<p>${m.empty}</p>`:nothing}
      ${this.data?.items.length?html`<div class="table-container" tabindex="0" role="region" aria-label=${m.table}><table><caption>${m.caption}</caption><thead><tr><th scope="col">${m.code}</th><th scope="col">${m.label}</th><th scope="col">${m.state}</th><th scope="col">${m.actions}</th></tr></thead><tbody>${this.data.items.map(profile=>html`<tr><td>${profile.code}</td><td>${profile.label}<p>${profile.description}</p></td><td>${profile.status}</td><td><div class="actions"><button ?disabled=${this.busy} aria-label=${`${m.modify} ${profile.label}`} @click=${()=>this.open(profile)}>${m.modify}</button><button ?disabled=${this.busy||!profile.active} aria-label=${`${m.deactivate} ${profile.label}`} @click=${()=>this.confirm(profile)}>${m.deactivate}</button></div>
        <p>${!profile.active?r.inactiveProfile:nothing}</p><button type="button" ?disabled=${this.busy||!profile.active} aria-label=${`${r.add} à ${profile.label}`} @click=${()=>this.showRequirement(profile)}>${r.add}</button><details @toggle=${(event:Event)=>this.showChildren(event,profile)}><summary>${m.requirements} ${profile.label}</summary>${this.childViews[profile.id]?.busy?html`<p role="status">${m.requirementsLoading}</p>`:this.childViews[profile.id]?.error?html`<p role="alert">${this.childViews[profile.id].error}</p><button @click=${()=>this.loadChildren(profile)}>${m.requirementsRetry}</button>`:this.childViews[profile.id]?.items.length?html`<ul>${this.childViews[profile.id].items.map(child=>html`<li>${child.competencyLabel} — ${child.classificationLabel} <button type="button" aria-label=${`${r.reclassify} ${child.competencyLabel}`} @click=${()=>this.showRequirement(profile,child)}>${r.reclassify}</button></li>`)}</ul>`:html`<p>${m.requirementsEmpty}</p>`}</details>
      </td></tr>`)}</tbody></table></div>`:nothing}
      ${this.data&&this.data.total>this.data.size?html`<nav aria-label=${m.pagination}><button ?disabled=${this.busy||this.data.page===0} @click=${()=>this.load(this.data!.page-1)}>${m.previous}</button><span aria-current="page">Page ${this.data.page+1}</span><button ?disabled=${this.busy||(this.data.page+1)*this.data.size>=this.data.total} @click=${()=>this.load(this.data!.page+1)}>${m.next}</button></nav>`:nothing}
    </section>
    <requirements-editor @requirement-saved=${this.requirementSaved}></requirements-editor>
    <dialog id="profile-editor" aria-labelledby="profile-editor-title" @cancel=${(event:Event)=>{if(this.busy)event.preventDefault();}}><h2 id="profile-editor-title">${this.editing?m.edit:m.create}</h2><p role="status" aria-label=${m.formStatus}>${this.busy?m.saving:''}</p>
      ${this.formError?html`<p id="profile-form-error" role="alert" tabindex="-1">${this.formError}</p>`:nothing}
      ${this.stale?html`<button ?disabled=${this.busy} @click=${this.reloadEditing}>${m.reload}</button>`:nothing}
      <form id="profile-form" @submit=${this.submit}><fieldset ?disabled=${this.busy}><label for="profile-code">${m.code}</label><input id="profile-code" name="code" required maxlength="64" autocomplete="off" aria-invalid=${this.fields.code?'true':'false'} aria-describedby=${this.fields.code?'code-help code-error':'code-help'}><p id="code-help">${m.codeHelp}</p>${this.fields.code?html`<p class="field-error" id="code-error">${this.fields.code}</p>`:nothing}
        <label for="profile-label">${m.label}</label><input id="profile-label" name="label" required maxlength="200" aria-invalid=${this.fields.label?'true':'false'} aria-describedby=${this.fields.label?'label-error':nothing}>${this.fields.label?html`<p class="field-error" id="label-error">${this.fields.label}</p>`:nothing}
        <label for="profile-description">${m.description}</label><textarea id="profile-description" name="description" maxlength="4000" rows="4" aria-invalid=${this.fields.description?'true':'false'} aria-describedby=${this.fields.description?'description-error':nothing}></textarea>${this.fields.description?html`<p class="field-error" id="description-error">${this.fields.description}</p>`:nothing}
        <div class="actions"><button type="button" @click=${()=>this.dialog('#profile-editor').close()}>${m.cancel}</button><button type="submit">${m.save}</button></div>
      </fieldset></form>
    </dialog>
    <dialog id="profile-disable" aria-labelledby="disable-title" @cancel=${(event:Event)=>{if(this.busy)event.preventDefault();}}><h2 id="disable-title">${m.disable}</h2><p>${this.pending?.label}</p><p>${m.disableHelp}</p><p role="status" aria-label=${m.disableStatus}>${this.busy?m.disabling:''}</p>${this.formError?html`<p id="disable-error" role="alert" tabindex="-1">${this.formError}</p>`:nothing}<div class="actions"><button ?disabled=${this.busy} @click=${()=>this.dialog('#profile-disable').close()} autofocus>${m.cancel}</button><button ?disabled=${this.busy} @click=${this.deactivate}>${m.confirmDisable}</button></div></dialog>
  `;}
}
customElements.define('profiles-panel',ProfilesPanel);
