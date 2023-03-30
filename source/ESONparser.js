const ESONraw={
  getchildren:function(eson=''){
    eson=eson.trimStart();
    let obj={};
    while(true){
      if(eson.startsWith('}') || eson.startsWith(']')){
        eson=eson.substring(1).trimStart();
        if(eson.startsWith(',')){
          eson=eson.substring(1).trimStart();
        }
        return [obj,eson];
      }
      if(eson.startsWith('[')){
        //array
        let array=[];
        eson=eson.substring(1);
        while(true){
          eson=eson.trimStart();
          if(eson.startsWith(']')){
            //stop
            return [array,eson];
          }
          const commapos=eson.indexOf(',');
          if(commapos==-1 || commapos>eson.indexOf(']')){
            const tempEson=eson.substring(0,eson.indexOf(']'))+',';
            eson=tempEson+eson.substring(eson.indexOf(']'));
          }
          if(eson.startsWith("'")){
            eson=eson.substring(1);
            const value=eson.substring(0, eson.indexOf("'")).replace(/\^\^\^\^\^\[QUOTE\]\^\^\^\^\^/g, "'");
            eson=eson.substring(eson.indexOf("'")+1);
            array.push(value);
          }else if(eson.startsWith("{")){
            eson=eson.substring(1);
            const tempEson=this.getchildren(eson);
            eson=tempEson[1];
            array.push(tempEson[0]);
          }else if(eson.startsWith("[")){
            eson=eson.substring(1);
            const tempEson=this.getchildren(eson);
            eson=tempEson[1];
            array.push(tempEson[0]);
          }else{
            const value=eson.substring(0,eson.indexOf(',')).trimEnd().replace(/\^\^\^\^\^\[QUOTE\]\^\^\^\^\^/g, "'");
            eson=eson.substring(eson.indexOf(',')+1);
            array.push(value);
          }
        }
      }
      if(!eson.includes('=')) {
        console.log('beforeError: '+eson);
        throw new Error('Invalid ESON format.');
      }
      const currentObjName=eson.substring(0,eson.indexOf('=')).trimEnd();
      eson=eson.substring(eson.indexOf('=')+1).trimStart();
      const commapos=eson.indexOf(',');
      if(commapos==-1){
        console.log('not found: '+eson);
        const tempEson=eson.substring(0,eson.indexOf('}'))+',';
        eson=tempEson+eson.substring(eson.indexOf('}'));
      }
      if(eson.indexOf('}')<commapos){
        const tempEson=eson.substring(0,eson.indexOf('}'))+',';
        eson=tempEson+eson.substring(eson.indexOf('}'));
      }
      if(eson.startsWith("'")){
        eson=eson.substring(1);
        const value=eson.substring(0,eson.indexOf("'")).replace(/\^\^\^\^\^\[QUOTE\]\^\^\^\^\^/g, "'");
        eson=eson.substring(eson.indexOf("'")+1).trimStart();
        if(eson.startsWith(',')){
          eson=eson.substring(1).trimStart();
        };
        Object.assign(obj,{[currentObjName]:value});
      }else if(eson.startsWith("{")){
        eson=eson.substring(1);
        const tempEson=this.getchildren(eson);
        eson=tempEson[1];
        Object.assign(obj,{[currentObjName]:tempEson[0]});
      }else if(eson.startsWith("[")){
        //array
        const tempEson=this.getchildren(eson);
        eson=tempEson[1];
        Object.assign(obj,{[currentObjName]:tempEson[0]});
      }else{
        const value=eson.substring(0,eson.indexOf(',')).trimEnd().replace(/\^\^\^\^\^\[QUOTE\]\^\^\^\^\^/g, "'");
        eson=eson.substring(eson.indexOf(',')+1).trimStart();
        Object.assign(obj,{[currentObjName]:value});
      }
    }
  },
  parse:function(eson=''){
    const date=Date.now();
    let tryCount=0;
    let obj={};
    //anti '
    eson=eson.replace(/\\'/g, '^^^^^[QUOTE]^^^^^');
    while(true){
      tryCount++;
      if(tryCount>10){
        throw 'Unknown Error while parsing ESON.';
      }
      eson=eson.trimStart();
      if(eson.startsWith('}')){
        eson=eson.substring(1).trimStart();
        if(eson.startsWith(',')){
          eson=eson.substring(1).trimStart();
        }
      }
      if(!eson.includes('=')){
        break;
      }
      if(eson.startsWith('{')){
        eson=eson.substring(1).trimStart();
        const getChild=this.getchildren(eson);
        Object.assign(obj,getChild[0]);
        eson=getChild[1];
      }else{
        const currentObjName=eson.substring(0,eson.indexOf('='));
        eson=eson.substring(eson.indexOf('=')+1).trimStart();
        const commapos=eson.indexOf(',');
        if(commapos>eson.indexOf('}') || commapos==-1){
          console.log('before'+eson);
          const tempEson=eson.substring(0, eson.indexOf('}'))+',';
          eson=tempEson+eson.substring(eson.indexOf('}')).trimStart();
          console.log('after'+eson);
        }
        if(eson.startsWith('{')){
          eson=eson.substring(1);
          const tempEson=this.getchildren(eson);
          eson=tempEson[1];
          Object.assign(obj,{[currentObjName]:tempEson[0]});
          continue;
        }
        const value=eson.substring(0,eson.indexOf(',')).trimEnd();
        eson=eson.substring(eson.indexOf(',')+1).trimStart();
        Object.assign(obj,{[currentObjName]:value});
      }
    };
    console.log('taken time: '+(Date.now()-date));
    return obj;
  },
  strnumToNum:function(obj={}){
    Object.entries(obj).forEach(entry=>{
      if(entry[1] instanceof Array){
        obj[entry[0]]=this.strnumToNum(entry[1]);
      }else if(entry[1] instanceof Object){
        obj[entry[0]]=this.strnumToNum(entry[1]);
      }else if(typeof entry[1] == 'string'){
        const numbered=Number(entry[1]);
        if(isNaN(numbered)){
          return;
        }else{
          obj[entry[0]]=numbered;
        }
      }else{
        throw 'Invalid entry type. entry:'+typeof(entry[1]);
      }
    });
    return obj;
  },
  stringify:function(obj={}){
    let stringified=JSON.stringify(obj).replace(/'/g, '\\\'');
    let separated=stringified.split('"');
    let done='';
    // return stringified.replace(/(\":)/g, '=').replace(/\"/g, '');
    let count=0;
    while(true){
      count++;
      if(separated.length<2){
        console.log('break because separated.length<2');
        break;
      }
      let type=0;
      const processing=separated.splice(0, 2);
      console.log('before:')
      console.log(processing[1]+'\n');
      if(processing[1].includes(' ') || processing[1].includes(',')){
        const colonchecker=stringified.substring(stringified.indexOf(processing[1])+2+processing[1].length).substring(0,5);
        console.log('colonchecker: '+colonchecker);
        if(colonchecker.startsWith(':')){
          //this is objectname
          stringified=stringified.replace(`"${processing[1]}":`, `'${processing[1]}^^^^^'=`);
        }else{
          stringified=stringified.replace(`"${processing[1]}"`, `'${processing[1]}^^^^^'`);
        }
        type=1;
      }else{
        const colonchecker=stringified.substring(stringified.indexOf(`"${processing[1]}"`)+2+processing[1].length).substring(0,5);
        console.log('colonchecker: '+colonchecker);
        if(colonchecker.startsWith(':')){
          //this is objectname
          stringified=stringified.replace(`"${processing[1]}":`, `${processing[1]}^^^^^=`);
        }else{
          stringified=stringified.replace(`"${processing[1]}"`, processing[1]+'^^^^^');
        }
        type=2;
      }
      console.log('after:');
      console.log(stringified+'\n\n');
    };
    console.log('\n\n');
    console.log(stringified);
    return stringified.replace(/\^\^\^\^\^/g, '');
  }
}