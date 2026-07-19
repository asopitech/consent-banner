import type {ConsentChoice,ConsentState,StoredConsent} from './types';
let memory:StoredConsent|null=null;
export class ConsentStorage{constructor(private key:string,private version:string){}
private ls():Storage|null{try{return window.localStorage}catch{return null}}
read():{state:ConsentState;updatedAt:string|null}{const raw=this.ls()?.getItem(this.key)??(memory?JSON.stringify(memory):null); if(!raw)return{state:'unknown',updatedAt:null}; try{const v=JSON.parse(raw) as Partial<StoredConsent>; if((v.state==='granted'||v.state==='denied')&&v.version===this.version&&typeof v.updatedAt==='string')return{state:v.state,updatedAt:v.updatedAt}}catch{} return{state:'unknown',updatedAt:null}}
save(state:ConsentChoice):StoredConsent{const item={state,version:this.version,updatedAt:new Date().toISOString()}; memory=item; try{this.ls()?.setItem(this.key,JSON.stringify(item))}catch{} return item}
reset():void{memory=null; try{this.ls()?.removeItem(this.key)}catch{}}
}
