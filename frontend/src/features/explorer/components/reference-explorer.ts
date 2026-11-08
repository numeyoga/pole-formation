import {LitElement,html,css,nothing} from 'lit';
import {explorerApi} from '../adapters/explorer-api';
import type {ReferenceNode,ReferencePage,SearchPage} from '../presentation/models';
import {ApiError} from '../../../shared/http/session';
import {explorerMessages as m,messages} from '../../../shared/i18n/fr';

type Kind='domain'|'subdomain';
interface Branch {data:ReferencePage|null;busy:boolean;error:string;page:number}
export class ReferenceExplorer extends LitElement {
  static properties={domains:{state:true},results:{state:true},branches:{state:true},query:{state:true},searched:{state:true},busy:{state:true},error:{state:true}};
  declare domains:ReferencePage|null;
  declare results:SearchPage|null;
  declare branches:Record<string,Branch>;
  declare query:string;
  declare searched:string|null;
  declare busy:boolean;
  declare error:string;
  private generation=0;
  constructor(){super();this.domains=null;this.results=null;this.branches={};this.query='';this.searched=null;this.busy=false;this.error='';}
  static styles=css`
    :host{display:block;margin-block-start:var(--space-section);padding:var(--space-section);background:var(--color-surface);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);}
    *{box-sizing:border-box;}h2{font-size:var(--text-section);margin:0;}h3{font-size:var(--text-base);margin:0;}
    header,form,nav{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-small);}
    label{display:grid;grid-template-columns:minmax(0,1fr);gap:var(--space-small);inline-size:var(--control-width);min-inline-size:0;max-inline-size:100%;}form{margin-block:var(--space-normal);}
    input,button{font:inherit;min-block-size:var(--control-height);padding:var(--space-control);border:var(--border-width) solid var(--color-border);border-radius:var(--control-radius);color:var(--color-text);background:var(--color-surface);max-inline-size:100%;}
    input{inline-size:100%;min-inline-size:0;}button{color:var(--color-primary);cursor:pointer;}button:disabled{opacity:var(--disabled-opacity);cursor:default;}
    button:hover{color:var(--color-hover);text-decoration:underline;}:focus-visible{outline:var(--focus-width) solid var(--color-focus);outline-offset:var(--focus-width);}
    ul,ol{padding-inline-start:var(--space-section);margin-block:var(--space-small);}li{padding-block:var(--space-small);overflow-wrap:anywhere;}
    summary{cursor:pointer;min-block-size:var(--control-height);padding-block:var(--space-small);overflow-wrap:anywhere;}
    p{margin-block:var(--space-small);overflow-wrap:anywhere;}[role=alert]{color:var(--color-danger);}nav{margin-block:var(--space-small);}
  `;
  connectedCallback(){super.connectedCallback();void this.load();}
  disconnectedCallback(){super.disconnectedCallback();this.generation++;}
  async focusHeading(){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#explorer-title')?.focus();}
  private message(error:unknown){return error instanceof ApiError?error.message:messages.network;}
  private async load(page=0,focus=false){
    const generation=++this.generation;this.busy=true;this.error='';this.domains=null;this.results=null;this.branches={};this.searched=null;this.query='';
    try{const data=await explorerApi.domains(page);if(generation===this.generation){this.domains=data;if(focus)await this.focusHeading();}}
    catch(error){if(generation===this.generation)this.error=this.message(error);}
    finally{if(generation===this.generation)this.busy=false;}
  }
  private async search(event?:SubmitEvent,page=0){
    event?.preventDefault();if(this.busy)return;
    const query=event?this.query:this.searched??this.query;
    if(!query.trim()){await this.load();return;}
    const generation=++this.generation;this.busy=true;this.error='';this.results=null;this.searched=query;
    try{const data=await explorerApi.search(query,page);if(generation===this.generation){this.results=data;await this.updateComplete;this.renderRoot.querySelector<HTMLElement>('#explorer-results')?.focus();}}
    catch(error){if(generation===this.generation)this.error=this.message(error);}
    finally{if(generation===this.generation)this.busy=false;}
  }
  private async loadBranch(kind:Kind,node:ReferenceNode,page=0,focus=false){
    const generation=this.generation,key=`${kind}:${node.id}`;
    this.branches={...this.branches,[key]:{data:null,busy:true,error:'',page}};
    try{
      const data=await(kind==='domain'?explorerApi.subdomains(node.id,page):explorerApi.competencies(node.id,page));
      if(generation===this.generation){this.branches={...this.branches,[key]:{data,busy:false,error:'',page}};if(focus){await this.updateComplete;this.renderRoot.querySelector<HTMLElement>(`details[data-branch="${key}"] > summary`)?.focus();}}
    }catch(error){if(generation===this.generation)this.branches={...this.branches,[key]:{data:null,busy:false,error:this.message(error),page}};}
  }
  private toggle(event:Event,kind:Kind,node:ReferenceNode){if((event.currentTarget as HTMLDetailsElement).open&&!this.branches[`${kind}:${node.id}`])void this.loadBranch(kind,node);}
  private pagination(data:{page:number;size:number;total:number},busy:boolean,label:string,load:(page:number)=>void){
    return data.total>data.size?html`<nav aria-label=${label}><button type="button" ?disabled=${busy||data.page===0} @click=${()=>load(data.page-1)}>${m.previous}</button><span aria-current="page">${m.page} ${data.page+1}</span><button type="button" ?disabled=${busy||(data.page+1)*data.size>=data.total} @click=${()=>load(data.page+1)}>${m.next}</button></nav>`:nothing;
  }
  private renderChildren(kind:Kind,node:ReferenceNode){
    const branch=this.branches[`${kind}:${node.id}`];
    if(!branch)return nothing;
    return html`
      ${branch.busy?html`<p role="status">${m.loading}</p>`:nothing}
      ${branch.error?html`<p role="alert">${branch.error}</p><button type="button" @click=${()=>this.loadBranch(kind,node,branch.page)}>${m.retryBranch} ${node.label}</button>`:nothing}
      ${branch.data?html`
        ${!branch.data.items.length?html`<p>${kind==='domain'?m.noSubdomains:m.noCompetencies}</p>`:html`<ul>${branch.data.items.map(child=>kind==='domain'?this.branch('subdomain',child):html`<li>${m.competency} : ${child.code} — ${child.label} (${child.status})</li>`)}</ul>`}
        ${this.pagination(branch.data,branch.busy,`${m.pagination} ${node.code}`,page=>void this.loadBranch(kind,node,page,true))}`:nothing}`;
  }
  private branch(kind:Kind,node:ReferenceNode):ReturnType<typeof html>{
    return html`<li><details data-branch=${`${kind}:${node.id}`} @toggle=${(event:Event)=>this.toggle(event,kind,node)}><summary>${kind==='domain'?m.domain:m.subdomain} : ${node.code} — ${node.label} (${node.status})</summary>${this.renderChildren(kind,node)}</details></li>`;
  }
  render(){return html`<section aria-labelledby="explorer-title">
    <header><h2 id="explorer-title" tabindex="-1">${m.title}</h2><button type="button" ?disabled=${this.busy} @click=${()=>this.load()}>${m.refresh}</button></header>
    <p>${m.description}</p>
    <form role="search" @submit=${this.search}><label for="explorer-query">${m.query}<input id="explorer-query" name="q" maxlength="200" type="search" .value=${this.query} @input=${(event:Event)=>{this.query=(event.target as HTMLInputElement).value;}} aria-describedby="explorer-help"></label><button type="submit" ?disabled=${this.busy}>${m.search}</button><button type="button" ?disabled=${this.busy} @click=${()=>this.load()}>${m.browse}</button></form>
    <p id="explorer-help">${m.help}</p>
    ${this.error?html`<p role="alert">${this.error}</p><button type="button" ?disabled=${this.busy} @click=${()=>this.searched===null?this.load():this.search()}>${messages.retry}</button>`:nothing}
    <p role="status" aria-label=${m.status}>${this.busy?m.loading:this.results?`${this.results.total} ${m.resultCount}`:this.domains?`${this.domains.total} ${m.domainCount}`:''}</p>
    ${this.searched===null&&this.domains?html`${!this.domains.items.length?html`<p>${m.empty}</p>`:html`<ul aria-label=${m.hierarchy}>${this.domains.items.map(node=>this.branch('domain',node))}</ul>`}${this.pagination(this.domains,this.busy,m.domainPagination,page=>void this.load(page,true))}`:nothing}
    ${this.results?html`<h3 id="explorer-results" tabindex="-1">${m.results} : ${this.searched}</h3>${!this.results.items.length?html`<p>${m.noResults}</p>`:html`<ol aria-label=${m.results}>${this.results.items.map(item=>html`<li><h3>${item.code} — ${item.label} (${item.status})</h3><p>${m.path} : ${item.path}</p></li>`)}</ol>`}${this.pagination(this.results,this.busy,m.resultPagination,page=>void this.search(undefined,page))}`:nothing}
  </section>`;}
}
customElements.define('reference-explorer',ReferenceExplorer);
