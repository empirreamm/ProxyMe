import A from "./A.js";
class B extends A{
  constructor(){
    super();
  }
}
let b=new B();
b.addChange("Prueba");
console.log(b.changes);
b.changes=[];
console.log(b.changes);
b.modificable="prueba2";
console.log(b.changes);