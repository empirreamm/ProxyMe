# ProxyMe
Generates a Proxy for clasess and objects and uses listeners to warn about any change to the elements.

## Install
```cli
  npm intall proxyme-js
```
## Require
  For NodeJS in module or Browser:
  ```javascript
    import ProxyMe from "proxyme-js";
  ```
## Use with objects

```javascript
  let objPrueba={
    a:"A",
    b:"B",
    subLevel:{
      a:"A2",
      b:"B2"
    }
  }

  let proxied=ProxyMe(objPrueba);
  proxied.on("set",
    (obj,prop,newVal,oldVal,receiver)=>{
      console.group(`Setted ${prop}`);
      console.log("Old Value: ",oldVal);
      console.log("New Value: ",newVal);
      console.log("Object:",obj);
      console.log("Receiver:",receiver);
      console.groupEnd();
    }
  );

  proxied.a="New a";

  /* Console
    Setted a
      Old Value:  A
      New Value:  New A
      Object: { a: 'New A', b: 'B', subLevel: { a: 'A2', b: 'B2' } }  
      Receiver: { a: 'New A', b: 'B', subLevel: { a: 'A2', b: 'B2' } }
  */

  proxied.subLevel.a="New A2";

  /* Console
    Setted subLevel.a
      Old Value:  A2
      New Value:  New A2
      Object: { a: 'New A', b: 'B', subLevel: { a: 'New A2', b: 'B2' } }
      Receiver: { a: 'New A2', b: 'B2' }
  */
  
```

If the object is changed by a function inside the object the prop value is going to be: "byFunction: ${functionName}" and all the individual changes will be discarded. (This is because the addition of this functionality can make the code so much bigger and more complex to debug).


## Access sublevel object with string

Continuing with previous example.

In this example it's interesting to note that assigning value 

```javascript 
  proxied["subLevel.a"]="New new A2";

  /* Console
      Setted subLevel.a
        Old Value:  New A2
        New Value:  New new A2
        Object: { a: 'New A', b: 'B', subLevel: { a: 'New new A2', b: 'B2' } }
        Receiver: { a: 'New new A2', b: 'B2' }
  */

  console.log(proxied["subLevel.a"]);

  /* Console
      New new A2
  */
```


## Cancel Set Action

Continuing with previous example.

If the set listener returns a string "#cancel" the set action will be canceled and the element will matain the oldVal.

```javascript 
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
  /* Console
      Unable to modify b
      Unable to modify subLevel.b
      { a: 'I should be modified', b: 'B', subLevel: { a: 'A2', b: 'B2' } }
  */
```
## Proxy Class
  Proxied Classes works the same as proxied objects.
```javascript 
  class A{
    constructor(){
      this.a="A";
      this.secondLevel={a:"A2"};
    }
    changeA(newName){
      this.a="changeA A";
      this.secondLevel.a="changeA A2";
    }
  }
  let AProxied=ProxyMe(new A());
  AProxied.on("set",
    (obj,prop,newVal,oldVal,receiver)=>{
      console.group(`Setted ${prop}`);
      console.log("Old Value: ",oldVal);
      console.log("New Value: ",newVal);
      console.log("Object:",obj);
      console.log("Receiver:",receiver);
      console.groupEnd();
    }
  );

  AProxied.a="New A";

  /* Console
      Setted a
        Old Value:  A
        New Value:  New A
        Object: A { a: 'New A', secondLevel: { a: 'A2' } }  
        Receiver: A { a: 'New A', secondLevel: { a: 'A2' } }
  */
```

But we can extend them:
```javascript 
  class A{
    constructor(){
      this.a="A";
      this.secondLevel={a:"A2"};
    }
    changeA(newName){
      this.a="changeA A";
      this.secondLevel.a="changeA A2";
    }
    //You can assign the listeners inside the constructor class with the function __onProxied()
    __onProxied(){
      this.on("set",
        ()=>{
          console.log("From A __onProxied set listener");
        }
      );
    }
  }
  let AProxied=ProxyMe(A);

  class B extends AProxied{
    constructor(){
      super();
      this.a="B->A";
      this.b="B";
      this.secondLevel.a="B->A2";
    }
  }
  let BProxied=new B();
  BProxied.on("set",
    (obj,prop,newVal,oldVal,receiver)=>{
      console.group(`Setted ${prop}`);
      console.log("Old Value: ",oldVal);
      console.log("New Value: ",newVal);
      console.log("Object:",obj);
      console.log("Receiver:",receiver);
      console.groupEnd();
    }
  );

  BProxied.a="New A";

  /* Console
      From A __onProxied set listener

      Setted a
        Old Value:  B->A
        New Value:  New A
        Object: B { a: 'New A', secondLevel: { a: 'B->A2' }, b: 'B' }  
        Receiver: B { a: 'New A', secondLevel: { a: 'B->A2' }, b: 'B' }
  */

 BProxied.changeA("New Custom A");

 /* Console
      From A __onProxied set listener

      Setted byFunction: changeA
        Old Value:  {"a":"New A","secondLevel":{"a":"B->A2"},"b":"B"}
        New Value:  {"a":"changeA A","secondLevel":{"a":"changeA A2"},"b":"B"}  
        Object: B { a: 'changeA A', secondLevel: { a: 'changeA A2' }, b: 'B' }  
        Receiver: B { a: 'changeA A', secondLevel: { a: 'changeA A2' }, b: 'B' }
  */
```
The proxied class works the same as a proxied object.

## Proxy the get

```javascript
    let objPrueba={
      a:"A",
      b:"B",
      subLevel:{
        a:"A2",
        b:"B2"
      }
    }

    let proxied=ProxyMe(objPrueba);
    proxied.on("get",
      (obj,prop,value,receiver)=>{
        console.group(`Getted ${prop}`);
        console.log("Value:",value);
        console.log("Object:",obj);
        console.log("Receiver:",receiver);
        console.groupEnd();
      }
    );

    proxied.a;

    /* Console
      Getted a
        Value: A
        Object: { a: 'A', b: 'B', subLevel: { a: 'A2', b: 'B2' } }  
        Receiver: { a: 'A', b: 'B', subLevel: { a: 'A2', b: 'B2' } }
    */

   proxied.subLevel.a;

    /* Console
      Getted subLevel
        Value: { a: 'A2', b: 'B2' }
        Object: { a: 'A', b: 'B', subLevel: { a: 'A2', b: 'B2' } }  
        Receiver: { a: 'A', b: 'B', subLevel: { a: 'A2', b: 'B2' } }
      Getted subLevel.a
        Value: A2
        Object: { a: 'A', b: 'B', subLevel: { a: 'A2', b: 'B2' } }  
        Receiver: { a: 'A2', b: 'B2' }
    */

   proxied["subLevel.a"];

   /* Console
      Getted subLevel.a
        Value: A2
        Object: { a: 'A', b: 'B', subLevel: { a: 'A2', b: 'B2' } }  
        Receiver: { a: 'A', b: 'B', subLevel: { a: 'A2', b: 'B2' } }
    */
```

# NICE DAY AND WONDERFUL CODING

### Author: Adrián Mercado Martínez.
### Last modification: 2021-10-19