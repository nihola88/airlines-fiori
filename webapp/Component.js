sap.ui.define([
    "sap/ui/core/UIComponent",
    "s4tairlines/s4tairlines/model/models",
    "sap/ui/model/json/JSONModel"
], (UIComponent, models,JSONModel) => {
    "use strict";

    return UIComponent.extend("s4tairlines.s4tairlines.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);
         
            // set the device model
            this.setModel(models.createDeviceModel(), "device");
            // enable routing
            this.getRouter().initialize();

        },

        getNestedData(pView, callingContext){
            var that = this;
            this.getModel("S4TOData").read("/ScarrSet",{
                async: false,
                urlParameters: { $expand: "ToSpfli/ToSflight"
                },
                success: function( S4TOData ){
                  that.setModel(new JSONModel(S4TOData.results),"nestedData");
                  let aSpfliSet = [];
                  for (let i = 0; i< S4TOData.results;i++){
                    aSpfli
                  }
                  var oNestedData = callingContext.getOwnerComponent().getModel("nestedData");
                  callingContext.lNestedData = oNestedData ? oNestedData.getData() : undefined;
                  callingContext._createLocalModel(callingContext.lNestedData);
                  if(pView){
                    pView.setBusy(false);
                  }
              },
              error: function(error){
                error;
                Message.show( error.message);
                pView.setBusy(false);
              }
          } )
        }
    });
});