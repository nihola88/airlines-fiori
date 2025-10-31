sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "s4tairlines/s4tairlines/model/formatter"
  ], (Controller,JSONModel,Message,formatter) => {
  "use strict";

    return Controller.extend("s4tairlines.s4tairlines.controller.Companies", {
        onInit(evt){

        },
        onAdd(evt){
          this.oScarrModel = new JSONModel(this.getView().getModel("protoModel").getProperty("/scarrModel"));
          this.oScarrModel.setData({});
          this.getView().setModel(this.oScarrModel, "scarrModel");
          this.onOpenDialog();
        },

        onSaveScarr(evt){
          
          let oData = this.getView().getModel("S4TOData");
          let that = this;

          if(!formatter.inputValidation(this.getView().byId("frgScarr").getAggregation("content"))){
            Message.show("Compilare campi obbligatori");
            return;
          }
          if(this.getView().byId("iCurrcode").getValueState() !== "None"){
            Message.show("Valuta non corretta");
            return;
          };

          this.oScarrModel = new JSONModel(
            {
              Carrid: this.byId("iCarrid").getValue(),
              Carrname: this.byId("iCarrname").getValue(),
              Currcode: this.byId("iCurrcode").getSelectedKey(),
              Url: this.byId("iUrl").getValue()
            }
          );
          this.getView().setModel(this.oScarrModel, "scarrModel");
          oData.create("/ScarrSet", this.oScarrModel.getData(),{
            success:function(oData){
              Message.show("OK");
              that.oDialog.close();
              that.getView().byId("tabScarr").refreshItems();
            },
            error:function(err){
              Message.sho("KO");
            }
          })
        },

        onCancelScarr(evt){
          this.oDialog.close();
        },

        onChangeCarrid(evt){
          let vValue = evt.getSource().getValue().toUpperCase();
          evt.getSource().setValue(vValue);
          if(vValue !== ''){
            evt.getSource().setValueState("None");
          }
        },

        onChangeCarrname(evt){
          let vValue = evt.getSource().getValue();
          if(vValue !== ''){
            evt.getSource().setValueState("None");
          }
        },
        onSelChange(evt){
          debugger;
        },

        onChangeCurrcode(evt){
          if(evt.getSource().getSelectedKey() === undefined
            || evt.getSource().getSelectedKey() === null 
            || evt.getSource().getSelectedKey() === '')
          {
            this.getView().byId("iCurrcode").setValueState("Error");
          }else{
            this.getView().byId("iCurrcode").setValueState("None");
          }
        },

        onEditScarr(evt){
          let vPath = evt.getSource().getBindingContext("S4TOData").getPath();
          this.oScarrModel = new JSONModel(evt.getSource().getModel("S4TOData").getProperty(vPath));
          this.getView().setModel(this.oScarrModel, "scarrModel");
          this.onOpenDialog();
        },

        onDelScarr(evt){
          let vPath = evt.getSource().getBindingContext("S4TOData").getPath();
          this.oScarrModel = new JSONModel(evt.getSource().getModel("S4TOData").getProperty(vPath));
          let that = this;
          this.getView().getModel("S4TOData").remove("/ScarrSet('"+this.oScarrModel.getProperty("/Carrid")+"')",{
            success:function(ok){
              Message.show("OK");
              that.getView().byId("tabScarr").refreshItems();
            },
            error:function(ko){
              Message.show("KO");
            }
          })
        },

        //async functions
        async onOpenDialog(){
          this.oDialog ??= await this.loadFragment({name:"s4tairlines.s4tairlines.fragments.scarr"});
          this.oDialog.open();
        },

        openDebugger(evt){
          debugger;
        }
    })
})