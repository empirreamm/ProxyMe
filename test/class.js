import ProxyMe from "../ProxyMe.js";
class A{
  constructor(){
    this.name="Adrián";
  }
  __onProxied(){
    this.on("set",
      ()=>{
        console.log("From a set");
      }
    );
  }
}
let AProx=ProxyMe(A);

class B extends AProx{
  constructor(){
    super();
    this.on("set",
      ()=>{
        console.log("From b set");
      }
    );
  }
}
let usable=new B();
usable.name="Adrián Mercado";
console.log(usable);