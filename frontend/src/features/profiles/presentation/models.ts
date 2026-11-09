export interface ProfileView {id:string;code:string;label:string;description:string;active:boolean;version:number;status:string}
export interface ProfilePage {items:ProfileView[];total:number;page:number;size:number}
export interface RequirementView {id:string;competencyId:string;competencyLabel:string;classificationId:string;classificationLabel:string;version:number}

export interface RequirementChoice {id:string;label:string}
export interface RequirementChoices {items:RequirementChoice[];total:number;page:number;size:number}
