import ProxyMe from "../ProxyMe.js";
let data={
  text:String,
  changer:"changer"
}
let nd=ProxyMe(data);
let d=Object.assign({},nd);
console.log(typeof nd.text,nd.text);
