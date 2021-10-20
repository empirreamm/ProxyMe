import ProxyMe from "../../ProxyMe.js";
class A{
  constructor(){
    Object.defineProperties(this, 
      {
        changes:{
          value:[],
          writable:true
        }
      },
      {
        midificable:{
          value:[],
          writable:true
        }
      }
    );
  }
  __onProxied(){
    this.on("set",
      (obj,key,value,oldValue)=>{
        this.changes.push({key,value,oldValue});
      }
    );
  }
  addChange(change){
    this.modificable=change;
  }
  cleanChanges(){
    this.changes=[];
  }
}
export default ProxyMe(A);