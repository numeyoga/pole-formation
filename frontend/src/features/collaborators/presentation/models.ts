export interface CollaboratorView {id:string;professionalId:string;firstName:string;lastName:string;active:boolean;version:number;label:string;status:string}
export interface CollaboratorPage {items:CollaboratorView[];total:number;page:number;size:number}
export interface CollaboratorFields {professionalId:string;firstName:string;lastName:string}
export interface CollaboratorSessions {items:{id:string;sessionId:string;title:string;status:string;participationStatus:string}[];total:number;page:number;size:number}
