export interface CompetencyView {id:string;subdomainId:string;code:string;label:string;active:boolean;version:number;status:string;parentCode:string;parentLabel:string;parentStatus:string}
export interface CompetencyPage {items:CompetencyView[];total:number;page:number;size:number}
export interface ParentOption {id:string;label:string;selectableForCreation:boolean}
