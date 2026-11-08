import createClient from 'openapi-fetch';
import type { paths as SearchPaths,components } from '../../../shared/http/explorer-generated';
import type { paths as DomainPaths } from '../../../shared/http/domains-generated';
import type { paths as SubdomainPaths } from '../../../shared/http/subdomains-generated';
import type { paths as CompetencyPaths } from '../../../shared/http/competencies-generated';
import type { ReferenceNode,ReferencePage,SearchMatch,SearchPage } from '../presentation/models';
import { ApiError } from '../../../shared/http/session';
import { messages } from '../../../shared/i18n/fr';

const searchClient=createClient<SearchPaths>({credentials:'same-origin'});
const domainClient=createClient<DomainPaths>({credentials:'same-origin'});
const subdomainClient=createClient<SubdomainPaths>({credentials:'same-origin'});
const competencyClient=createClient<CompetencyPaths>({credentials:'same-origin'});
export function referenceNode(dto:components['schemas']['Node']):ReferenceNode {
  return {id:dto.id,code:dto.code,label:dto.label,status:dto.active?'Actif':'Désactivé'};
}
export function searchMatch(dto:components['schemas']['Match']):SearchMatch {
  const nodes=[dto.domain,dto.subdomain,dto.competency].map(referenceNode);
  const competency=nodes[2];
  return {...competency,path:nodes.map(node=>`${node.code} — ${node.label} (${node.status})`).join(' → ')};
}
async function unwrap<T>(result:{data?:T;error?:unknown;response:Response}):Promise<T> {
  if(!result.response.ok){
    const error=result.error as {detail?:string}|undefined;
    throw new ApiError(result.response.status,result.response.status===401?messages.expired:result.response.status===403?messages.forbidden:error?.detail??messages.network);
  }
  return result.data as T;
}
export const explorerApi={
  async domains(page=0):Promise<ReferencePage>{
    const result=await unwrap(await domainClient.GET('/api/referentiels/domaines',{params:{query:{page,size:10}}}));
    return {...result,items:result.items.map(referenceNode)};
  },
  async subdomains(domainId:string,page=0):Promise<ReferencePage>{
    const result=await unwrap(await subdomainClient.GET('/api/referentiels/sous-domaines',{params:{query:{domainId,page,size:10}}}));
    return {...result,items:result.items.map(referenceNode)};
  },
  async competencies(subdomainId:string,page=0):Promise<ReferencePage>{
    const result=await unwrap(await competencyClient.GET('/api/referentiels/competences',{params:{query:{subdomainId,page,size:10}}}));
    return {...result,items:result.items.map(referenceNode)};
  },
  async search(q:string,page=0):Promise<SearchPage>{
    const result=await unwrap(await searchClient.GET('/api/referentiels/exploration/competences',{params:{query:{q,page,size:10}}}));
    return {...result,items:result.items.map(searchMatch)};
  },
};
