export interface SessionSummary {id:string;title:string;status:string}
export interface SessionView extends SessionSummary {
 state:string;capacityLabel:string;modalities:string;version:number;
 slots:{id:string;start:string;end:string}[];
}
export interface SessionFields {title:string;capacity:number|null;modalities:string}
