export interface Counts {registered:number;present:number;absent:number;withdrawn:number}
export interface Overview {activeFormations:number;sessions:Record<string,number>;participations:Counts;cancelledParticipations:Counts;realizedSessions:number}
export interface Filters {from?:string;until?:string;formationId?:string;state?:'BROUILLON'|'PLANIFIEE'|'TERMINEE'|'ANNULEE'}
export interface ActivitySession {id:string;title:string;status:string;firstSlot:string;counts:Counts}
export interface ActivityPage {items:ActivitySession[];total:number;page:number;size:number}
