export interface SubdomainView {id:string;domainId:string;code:string;label:string;active:boolean;version:number;status:string;parentCode:string;parentLabel:string;parentStatus:string}
export interface SubdomainPage {items:SubdomainView[];total:number;page:number;size:number}
export interface ParentOption {id:string;label:string;selectableForCreation:boolean}
export interface CompetencyView {id:string;label:string}
