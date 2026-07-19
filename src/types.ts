export type ConsentChoice='granted'|'denied';
export type ConsentState='unknown'|ConsentChoice;
export interface StoredConsent{state:ConsentChoice;version:string;updatedAt:string}
export interface ConsentDetails{state:ConsentState;version:string;updatedAt:string|null;analyticsLoaded:boolean}
export interface ConsentConfig{measurementId:string;measurementIdValid:boolean;policyUrl:string|null;language:'ja'|'en';theme:'auto'|'light'|'dark';position:'top'|'bottom';storageKey:string;consentVersion:string;debug:boolean;autoCss:boolean;reloadOnRevoke:boolean;script:HTMLScriptElement|null}
export interface ConsentMessages{title:string;description:string;allow:string;reject:string;learnMore:string;settingsTitle:string;close:string;currentState:string;unknown:string;granted:string;denied:string;purpose:string;privacyPolicy:string;settingsLabel:string}
export interface AsopiConsentApi{getState():ConsentState;getDetails():ConsentDetails;grant():Promise<void>;deny():void;reset():void;openSettings():void;closeSettings():void;onChange(callback:(details:ConsentDetails)=>void):()=>void}
declare global{interface Window{dataLayer?:unknown[];gtag?:(...args:unknown[])=>void;AsopiConsent?:AsopiConsentApi;__ASOPI_CONSENT_READY__?:boolean}}
