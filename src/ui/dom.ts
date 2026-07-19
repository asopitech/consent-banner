export function el<K extends keyof HTMLElementTagNameMap>(tag:K, cls?:string, text?:string):HTMLElementTagNameMap[K]{const node=document.createElement(tag); if(cls)node.className=cls; if(text)node.textContent=text; return node}
export function removeNode(node:Element|null):void{node?.parentNode?.removeChild(node)}
