export interface ProfileView {id:string;code:string;label:string;description:string;active:boolean;version:number;status:string}
export interface ProfilePage {items:ProfileView[];total:number;page:number;size:number}
export interface RequirementView {id:string;competencyLabel:string;classificationLabel:string}
