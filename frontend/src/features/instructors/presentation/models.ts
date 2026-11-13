export interface InstructorView {id:string;label:string;firstName:string;lastName:string;professionalContact:string;active:boolean;status:string;version:number;hasAccount:boolean;accountLabel:string;sessionCount:number;legacy:boolean}
export interface InstructorPage {items:InstructorView[];total:number;page:number;size:number}
export interface InstructorFields {firstName:string;lastName:string;professionalContact:string}
export interface InstructorSessions {items:{id:string;title:string;status:string}[];total:number;page:number;size:number}
