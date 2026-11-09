export type FormationState='BROUILLON'|'ACTIVE'|'ARCHIVEE';
export type FormationAction='activation'|'archivage'|'reactivation';
export interface FormationFields {code:string;title:string;objectives:string;description:string;durationMinutes:number|null}
export interface FormationView extends FormationFields {id:string;state:FormationState;status:string;version:number}
export interface FormationPage {items:FormationView[];total:number;page:number;size:number}
export interface FormationSession {id:string;title:string;status:string}
