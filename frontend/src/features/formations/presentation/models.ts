export type FormationState='BROUILLON'|'ACTIVE'|'ARCHIVEE';
export type FormationAction='activation'|'archivage'|'reactivation';
export interface FormationFields {code:string;title:string;objectives:string;description:string;durationMinutes:number|null}
export interface FormationView extends FormationFields {id:string;state:FormationState;status:string;version:number}
export interface FormationPage {items:FormationView[];total:number;page:number;size:number}
export interface FormationSession {id:string;title:string;status:string}

export interface CoverageView {id:string;competencyId:string;code:string;label:string;status:string}
export interface CoveragePage {items:CoverageView[];total:number;page:number;size:number}
export interface CompetencyChoice {id:string;code:string;label:string}
export interface CompetencyChoices {items:CompetencyChoice[];total:number;page:number;size:number}

export interface ProfileFormationView {id:string;code:string;title:string;sessionStatus:string}
export interface ProfileFormationsPage {items:ProfileFormationView[];total:number;page:number;size:number}

export interface ExplainedRequirementView {id:string;code:string;label:string;competencyStatus:string;classification:string}
export interface ExplanationPage {items:ExplainedRequirementView[];total:number;page:number;size:number}
