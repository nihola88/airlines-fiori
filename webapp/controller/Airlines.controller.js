sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "s4tairlines/s4tairlines/model/models",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast"
], (Controller, models, JSONModel, Message) => {
"use strict";

return Controller.extend("s4tairlines.s4tairlines.controller.Airlines", {
  onInit() {},
  onBeforeRendering() {
      this.getView().byId("Companies").setBusy(true);
      var that = this;
      // models.getCore().getModel("S4TOData").read("/ScarrSet",{
      if(!this.lNestedData){
        this.getView().setBusy(true);
        var that = this;
        let promise = new Promise(function(success,error ) {
          that.getOwnerComponent().getNestedData(that.getView(), that);

        } );
        
        promise.then(function(success){
          
        }, function(error){
          that.error();
        })
      }
    },
    error(error){},
    _createLocalModel(lNestedData){
      if (lNestedData) {
          var listTable = [];
          for (var i = 0; i < lNestedData.length; i++) {

              var sSpfliData = lNestedData[i].ToSpfli.results;

              for (var spfli = 0; spfli < sSpfliData.length; spfli++) {
                  var sLineData = {
                      "Carrid": lNestedData[i].Carrid,
                      "Carrname": lNestedData[i].Carrname,
                      "Url": lNestedData[i].Url,
                      "Connid": sSpfliData[spfli].Connid,
                      "Connection": sSpfliData[spfli].Cityfrom + " (" + sSpfliData[spfli].Countryfr + ")-" + sSpfliData[spfli].Cityto + " (" + sSpfliData[spfli].Countryto + ")",
                      "Distance":Number(sSpfliData[spfli].Distance).toLocaleString() + " " + sSpfliData[spfli].Distid
                  }

                  listTable.push(sLineData);
              }
          }
          var oListTable = new JSONModel(listTable);

          this.getView().setModel(oListTable, "listTable");
      }
      this.getView().byId("Companies").setBusy(false);
  },
  openDebugger(evt) {
      debugger
  },

  toSpfliData(evt) {
      var vConData = evt.getSource().getBindingContext("listTable").getObject();

      this.getOwnerComponent().getRouter().navTo("RouteConnections", {
        pSpfli: { Carrid: vConData.Carrid,
                  Connid: vConData.Connid 
                }
      });
  }
});
});
