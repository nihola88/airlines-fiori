sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "s4tairlines/s4tairlines/model/models",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/odata/v2/ODataModel"
  ], (Controller, models, JSONModel, Message,ODataModel) => {
  "use strict";

    return Controller.extend("s4tairlines.s4tairlines.controller.Customers", {
        onInit(evt){
          this.oData2Model = this.getOwnerComponent().getModel("S4TOData");
          this.getView().byId("smartFilterBar").setModel(this.oData2Model);
          this.getView().byId("smartFilterTab").setModel(this.oData2Model);
        },
        onBeforeRendering(){
          /*var that = this;
          this.getView().getModel("S4TOData").read("/zFlScustom",{
            async: false,
            success:function(oData){
              that.getView().byId("smartFilterBar").setModel(new JSONModel(oData.results), "scustom");
            },
            error:function(err){

            }
          })*/
        },
        openDebug(){
          debugger;
          var requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };
    
        var model = new JSONModel();
        model.loadData("https://api.genderize.io?name=john", null, true, "GET", null, false, null);
        this.getView().setModel(model, "bball")
    
        var model2 = new JSONModel();
        this.getView().setModel(model2, "bball2");
        //set bball model
            fetch("https://api.genderize.io?name=nicola", requestOptions)
            .then(response => {
              debugger;
              response.text()
            })
            .then(result =>  {
              debugger;  
              model2.setData(result)
            })
            .catch(error => {
              debugger;
              console.log('error', error)
            });
        }
    })
  })