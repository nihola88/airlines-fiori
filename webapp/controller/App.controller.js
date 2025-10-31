sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "s4tairlines/s4tairlines/model/models",
  "sap/ui/model/json/JSONModel"
], (BaseController, Message, models, JSONModel) => {
"use strict";

return BaseController.extend("s4tairlines.s4tairlines.controller.App", {
  onInit() {
      /*let oImage = new sap.m.Image();
      oImage.setSrc("https://cdn.countryflags.com/thumbs/italy/flag-round-250.png");
      oImage.setHeight("50px");
      oImage.setWidth("50px");*/
      this.oComponent = this.getOwnerComponent();
      this.getView().byId("selLang").setModel(new JSONModel({
              availableLang:
              [{
                      key: "it",
                      icon: "https://cdn.countryflags.com/thumbs/italy/flag-round-250.png",
                      language: "Italiano"
                  }, {
                      key: "en",
                      icon: "https://cdn.countryflags.com/thumbs/united-kingdom/flag-round-250.png",
                      language: "English"
                  }
              ]
          }))

      this.oComponent.oLoginLang = sap.ui.core.Configuration.getLanguage();
      switch (this.oComponent.oLoginLang) {
      case 'en' || 'it':
          this.byId("selLang").setSelectedKey(this.oComponent.oLoginLang);
          break;
      default:
      }
      
      

  },
  onBeforeRendering() {
      if (!this.getView().getModel("nestedData")) {
          this.getView().setBusy(true);
          var that = this;

          this.getView().getModel("S4TOData").read("/ScarrSet", {
              async: false,
              urlParameters: {
                  $expand: "ToSpfli/ToSflight"
                  //,$filter: "Carrid eq 'AZ'"
                  //,$select: "Carrid, Carrname, ToSpfli/Connid, ToSpfli/Cityfrom"
              },
              success: function (S4TOData) {
                  that.getOwnerComponent().setModel(new JSONModel(S4TOData.results), "nestedData");
                  that.getView().setBusy(false);
              },
              error: function (error) {
                  Message.show(error.message);
                  that.getView().setBusy(false)
              }
          })

          this.getView().getModel("S4TOData").read("/SpfliSet", {
              async: false,
              urlParameters: { //$expand: "ToSpfli/ToSflight"
                  //,$filter: "Carrid eq 'AZ'"
                  //,$select: "Carrid, Carrname, ToSpfli/Connid, ToSpfli/Cityfrom"
              },
              success: function (S4TOData) {
                  that.getOwnerComponent().setModel(new JSONModel(S4TOData.results), "SflightSet");
                  that.getView().byId("vizFrame").setModel(new JSONModel(S4TOData.results));
                  that.getView().setBusy(false);
              },
              error: function (error) {
                  Message.show(error.message);
                  that.getView().setBusy(false)
              }
          })
      }

  },
  onVizFrameLoaded(evt){
    var oFrameProp = this.byId("vizFrame").getVizProperties();
    oFrameProp.title.text = this.getView().getModel("i18n").getResourceBundle().getText("ChartTitle");
    this.byId("vizFrame").setVizProperties(oFrameProp);
  },
  
  onPress(evt) {
      this.getOwnerComponent().getRouter().navTo("RouteAirlines");
  },
  onPressCust(evt) {
      //this.getOwnerComponent().getRouter().getTargets().display("TargetCustomers");
      /*this.getView().setBusy(true);
      var that = this;
      this.getOwnerComponent().getModel("S4TOData").read("/zFlScustom",{
      success:function(oData){
      that.getOwnerComponent().setModel(new JSONModel(oData.results), "scustom");
      that.getView().setBusy(false);
      that.getOwnerComponent().getRouter().navTo("RouteCustomers");
      },
      error:function(err){
      that.getView().setBusy(false);
      }
      });*/
      this.getOwnerComponent().getRouter().navTo("RouteCustomers");
  },
  onPressComp(evt) {
      this.getOwnerComponent().getRouter().navTo("RouteCompanies");
  },

  onChangeLang(evt) {
      sap.ui.core.Configuration.setLanguage(evt.getSource().getSelectedKey());
  },

  onOpenDebug(evt) {
      debugger;
  }
});
});
