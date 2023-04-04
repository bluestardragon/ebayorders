import { Parser } from "htmlparser2";

export const getAspects = (data:any):any =>{
    const { detail } = data;
    let aspects = {};
    if( detail ){
        let carinfoParsing = false;
        let openedSpan = 0;
        let additionalParsing = 0;

        let carAspectValue = '';
        let carAspectName = '';
        const parser = new Parser({
            onopentag:(name, attributes)=>{
                if( name==='div' && attributes.id === 'carInfo'){
                    carinfoParsing = true;
                }
                if( name==='div' && (attributes.id === 'stockInfo' || attributes.id === 'notesInfo')){
                    additionalParsing++;
                }
                if( name==='span' && carinfoParsing && additionalParsing==0 && attributes.class==='label'){
                    openedSpan = 1;                    
                }
                if( name==='br' && carAspectName && carAspectValue){
                    aspects = {...aspects, [carAspectName.slice(0,-1)]:carAspectValue}
                }
            },
            ontext: text=>{
                if(carinfoParsing && additionalParsing==0 ){
                    if(openedSpan==1){
                        carAspectName = text;
                    }else {
                        carAspectValue = text;
                    }
                }
            },
            onclosetag: name=> {
                if(name==='div'){
                    if(additionalParsing>0) additionalParsing--; else carinfoParsing = false;                    
                }
                if( name==='span' && openedSpan>0){
                    openedSpan = 0;
                }
            }
        })
        parser.write(detail);
        parser.end();
        return aspects
    }else{
        return {};
    }
}