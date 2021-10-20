function proxyMe(data,name=null){
  Object.defineProperties(data,
    {
      __listeners:{
        value:{},
        writable:true
      },
      __proxy:{
        value:function(name,data){
          let prox=proxyMe(data,name);
          prox.on("set",(obj,key,value,oldVal,receiver)=>{
            let name=obj.__name;
            let subName=key;
            this.__emit("set",this,`${name}.${subName}`,value,oldVal,receiver);
          });
          prox.on("get",(obj,key,value,receiver)=>{
            let name=obj.__name;
            let subName=key;
            this.__emit("get",this,`${name}.${subName}`,value,receiver);
          })
          return prox;
        }
      },
      __emit:{
        value:function(name,...args){
          if(this.__isRunningFunction){
            return true;
          }
          /**Arguments must be always an array*/
          if(!Array.isArray(args)){
            args=[args];
          }
          /**Iterate over al listeners of the name if exists */
          if(Array.isArray(this.__listeners[name])){
            for(let callback of this.__listeners[name]){
              callback(...args);
            }
          }
        }
      },
      on:{
        value:function (name,callback){
          if(!this.__listeners[name]){
            this.__listeners[name]=[];
          }
          this.__listeners[name].push(callback);
          return this;
        },
        writable:true
      },
      __name:{
        value:name,
      },
      __isRunningFunction:{
        value:false,
        configurable:false,
        writable:true
      }
    }
  );
  return new Proxy(data,
    {
      construct(obj, argArray, newTarget){
        let res=Reflect.construct(obj, argArray, newTarget);
        let prox=proxyMe(res);
        if(typeof prox.__onProxied=="function"){
          prox.__onProxied();
        }
        return prox;
      },
      deleteProperty(obj, key) {
        if (key in obj) {
          let oldVal=obj[key];
          let res=delete obj[key];
          /**Send a undefined in the new value */
          obj.__emit("set",obj,key,undefined,oldVal,undefined);
          return res;
        }
      },
      get:(obj,key,receiver)=>{
        let value=obj[key];
        /**Emits a get action */
        let sended=false;
        if(value){
          sended=true;
          obj.__emit("get",obj,key,value,receiver);
        }
        /**Returns true for obj.isProxy */
        if(key=="isProxy"){
          return true;
        }
        /**If its a function just run and dont change anything */
        if(typeof obj[key]=="function"){
          return function(...args){
            let oldVal=typeof obj=="object"?JSON.stringify(obj):obj;
            obj.__isRunningFunction=true;
            let res=Reflect.apply(obj[key], this, args);
            obj.__isRunningFunction=false;
            if(!["on"].includes(key)){
              /**On a function call checks if new value is different of the old value and calls set if necesary */
              let newVal=typeof obj=="object"?JSON.stringify(obj):obj;
              if(oldVal!==newVal){
                /**Emits a set action */
                obj.__emit("set",obj,`byFunction: ${key}`,newVal,oldVal,receiver);
              }
            }
            return res;
          }.bind(obj)
        }
        /**Makes a proxy of the obj[key] if it is not already a proxy */
        if(typeof obj[key]=="object" && obj.propertyIsEnumerable(key) && !obj[key].isProxy){
          obj[key]=obj.__proxy(key,obj[key]);
        }
        /**If obj[key] dosn't exists and it contains periods try to go deeper to get a real value */
        if(!obj[key]){
          if(/\./g.exec(key)){
            let parts=key.split(".");
            let current=obj;
            for(let part of parts){
              if(current[part]){
                current=current[part];
              }else{
                return undefined;
              }
            }
            if(!sended){
              obj.__emit("get",obj,key,current,receiver);
            }
            return current;
          }else{
            return undefined;
          }
        }
        
        /**Gets the current value to return */
        return Reflect.get(obj,key,receiver);
      },
      set:(obj,key,value,receiver)=>{
        /**If key starts with "__" DONT check */
        if(key.startsWith("__")){
          obj[key]=value;
          return true;
        }
        /**Makes a proxy of the value if it is an object and is not already a proxy */
        if(typeof value=="object" && !value.isProxy){
          value=proxyMe(key,value);
        }
        /**If key has periods check if it already exists as a name or starts to generate new sublevels */
        if(!obj[key]){
          if(/\./.exec(key)){
            let parts=key.split(".");
            let last=parts.pop();
            let current=obj;
            /**Creates the whole sublevel */
            for(let part of parts){
              if(current[part]){
                current=current[part];
              }else{
                current[part]={};
                current=current[part];
              }
            }
            let oldVal=Reflect.get(current,last,receiver);
            let setVal=Reflect.set(current,last,value);
            return setVal;
          }
        }
        ///*Gets the current value and updates the value */
        let oldVal=Reflect.get(obj,key,receiver);
        let setVal=Reflect.set(obj,key,value,receiver);
        /**Emits a set action */
        obj.__emit("set",obj,key,value,oldVal,receiver);
        /**Returns the setVal */
        return setVal;
      }
    }
  );
}
export default proxyMe;