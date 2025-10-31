sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter"
], 
function (JSONModel, Device,UIComponent,Filter) {
    "use strict";

    return {
        OP:{
            eq: sap.ui.model.FilterOperator.EQ
        },
        /**
         * Provides runtime information for the device the UI5 app is running on as a JSONModel.
         * @returns {sap.ui.model.json.JSONModel} The device model.
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;

        },
        getCore: function(){
            return sap.ui.getCore();
        },

        getJSONDate(pDate){
            let [day, month, year] = pDate.split('/')
            pDate = new Date(+year, +month - 1, +day) 
            
            return new Date( pDate.getTime() - (pDate.getTimezoneOffset() * 60 * 1000)).toJSON().split(".")[0];
        },

        createFilter(field, op, valueLow, valueHigh){
            return new Filter(field, op, valueLow, valueHigh);
        }
    };

})