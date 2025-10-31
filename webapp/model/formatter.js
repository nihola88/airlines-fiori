sap.ui.define([
], () => {
    "use strict";

	return {
        setEnabled(param){
                var test;
                return false;
            },

        inputValidation(values){
            let isOk = true;
            for(let i=0;i<values.length;i++){
                if(!values[i].getRequired 
                || !values[i].getRequired() ){
                    continue;
                }
                switch(values[i].getMetadata().getName()){
                    case "sap.m.Input":
                        if(values[i].getValue() === ''){
                            values[i].setValueState("Error");
                            isOk = false;
                        }
                        break;
                    case "sap.m.ComboBox" || "sap.m.Select":
                        if(values[i].getSelectedKey() === ''){
                            values[i].setValueState("Error");
                            isOk = false;
                        }
                        break;
                    default:

                }
            }
            return isOk;
        }
    }
})