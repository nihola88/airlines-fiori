sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "s4tairlines/s4tairlines/model/models"
], (Controller,JSONModel,Message,models) => {
    "use strict";

    return Controller.extend("s4tairlines.s4tairlines.controller.Customer", {
        onInit(evt){
            this.getOwnerComponent().getRouter().getRoute("RouteCustomer").attachMatched(this._onRouteMatched, this)
        },
        onBeforeRendering(evt){
            this.getView();
        },
        _onRouteMatched(evt){
            let that = this;
            this.vCustomerId = evt.getParameter("arguments")["Customer"];
            this.getView().getModel("S4TOData").read("/zFlScustom('"+this.vCustomerId+"')",{
                success:function(oData){
                    that.getView().setModel(new JSONModel(oData), "customerData");
                }
            });
        },

        onChangeRating(evt){
            try{
                this.getView().byId("rating").setBusy(true);
                let that = this;
                let oSbookModel = this.getOwnerComponent().getModel("selSBookToCustomer");
                if(oSbookModel){
                    let vFlDate = encodeURIComponent(oSbookModel.getProperty("/Fldate").toJSON().split(".")[0]);
                    let vKey = "/zFlSbook(Carrid='"+oSbookModel.getProperty("/Carrid")+
                                "',Connid='"+oSbookModel.getProperty("/Connid")+
                                "',Fldate=datetime'"+vFlDate+
                                "',Bookid='"+oSbookModel.getProperty("/Bookid")+"')";
                    oSbookModel.setProperty("/Rating", evt.getParameter("value"));
                    let oSbookObject = oSbookModel.getData();
                    this.getView().getModel("S4TOData").update(vKey,oSbookObject,{
                        success:function(){
                            Message.show("Rating aggiornato");
                            let oRate = that.getView().byId("rating");
                            oSbookModel.setProperty("/Rating", oSbookObject.Rating)
                            oRate.setBusy(false);
                        },
                        error: function(err){
                            Message.show("Error");
                            that.getView().byId("rating").setBusy(false);
                        }
                    })
                }else{
                    Message.show("Rif non trovato");
                    this.getView().byId("rating").setBusy(false);
                }
        }
        catch{
            this.getView().byId("rating").setBusy(false);
        }
        },
        onOpenDebug(evt){
            debugger;
        }
    }
)
}
)