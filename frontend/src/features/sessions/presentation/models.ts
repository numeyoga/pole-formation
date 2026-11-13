export interface SessionSummary {id:string;title:string;status:string}
export interface SessionView extends SessionSummary {
 state:string;capacityLabel:string;modalities:string;version:number;
 instructors:{id:string;label:string;status:string}[];
 slots:{id:string;start:string;end:string;startInput:string;endInput:string}[];
}
export interface SessionFields {title:string;capacity:number|null;modalities:string}
