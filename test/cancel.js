import ProxyMe from "../ProxyMe.js";
let objPrueba={
  a:"A",
  b:"B",
  subLevel:{
    a:"A2",
    b:"B2"
  }
}

let proxied=ProxyMe(objPrueba);
proxied.on("set",(obj,prop,newVal,oldVal,receiver)=>{
  if(/b$/.exec(prop)){
    console.log(`Unable to modify ${prop}`);
    return "#cancel";
  }
});
proxied.b="This value should not be changed";
proxied.subLevel.b="This value neither changes";
proxied.a="I should be modified";
console.log(proxied);