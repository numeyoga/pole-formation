export interface ReferenceNode {id:string;code:string;label:string;status:string}
export interface ReferencePage {items:ReferenceNode[];total:number;page:number;size:number}
export interface SearchMatch {id:string;code:string;label:string;status:string;path:string}
export interface SearchPage {items:SearchMatch[];total:number;page:number;size:number}
