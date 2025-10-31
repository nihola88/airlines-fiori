sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "s4tairlines/s4tairlines/model/models",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v4/ODataModel",
    "sap/m/MessageToast"
], (Controller,models,JSONModel,ODataModel,Message) => {
    "use strict";

    return Controller.extend("s4tairlines.s4tairlines.controller.Connections", {
            onInit(evt){
                this.getOwnerComponent().getRouter().getRoute("RouteConnections").attachMatched(this._onRouteMatched, this);
                var oPrice = this.getView().byId("iPrice");
                oPrice.addEventDelegate({
                    onmouseover: this.onOverPrice.bind(this, evt),
                    onmouseout: this.onMouseOut.bind(this, evt)
                    //onmouseover: this.onOverPrice(evt).bind(this, oPrice)
                  });
            },
            _onRouteMatched(evt){
                this.getView().byId("flights").setVisible(false);
                var oArgs = evt.getParameter("arguments");
                this.oSpfliKey = oArgs["?pSpfli"];
                var oSpfli = this.getView().getModel("S4TOData").getProperty("/SpfliSet(Carrid='"+this.oSpfliKey.Carrid+"',Connid='"+this.oSpfliKey.Connid+"')");

                oSpfli.DepTime = new Date (oSpfli.Deptime.ms).toLocaleTimeString();
                oSpfli.ArrTime = new Date (oSpfli.Arrtime.ms).toLocaleTimeString();
                var mSpfli = new JSONModel(oSpfli);
                this.getView().setModel(mSpfli, "spfli");
            },

            onBeforeRendering(evt){
                this.sflightUpdate = [];
                this.getView().byId("iCurr").setEnabled(false);
            },
            openDebugger(evt){
                debugger;
            },

            onNavPress(oEvent){
                if(this.getView().byId("flights").getVisible()){
                    this.getView().byId("flights").setVisible(false);
                }
                else{

                var aSflights = this.getView().getModel("spfli").getProperty("/ToSflight").__list;
                var tSflights = [];
                for( var i = 0; i<aSflights.length; i++){
                    let oSflight = this.getOwnerComponent().getModel("S4TOData").getProperty("/"+ aSflights[i]);
                    oSflight.Key = aSflights[i];
                    oSflight.FlDate = new Date(oSflight.Fldate).toLocaleDateString();
                    oSflight.AvSeats = oSflight.Seatsmax - oSflight.Seatsocc;
                    tSflights.push(oSflight);
                }

                tSflights.sort((date1, date2)=> date1.Fldate - date2.Fldate);
                let oSflight = new JSONModel(tSflights);
                this.getView().setModel(oSflight, "sflight");
                this.getView().byId("flights").setVisible(true);
                this.byId("splitApp").to("connectionFlights");
            }
            },
            onSelectionChange(evt) {
                var selItems = evt.getParameter("listItems");
            
                for (var i = 0; i < selItems.length; i++) {
                    
                    var cells = selItems[i].getCells();
                    var cell = cells.find((cellParam) => {
                        return cellParam.mProperties.name === 'iCurr'
                    })
                        cell.setEnabled(selItems[i].getSelected());
                }
            },

            onChangeInput(evt){
                
                var oBindingContext = evt.getSource().getParent().getBindingContext("sflight");
                var vPath = oBindingContext.getPath();
                //upper case Currency
                var vNewCurr = evt.getParameter("newValue").toUpperCase();
                oBindingContext.getModel("sflight").setProperty(vPath+"/Currency",vNewCurr)
                
                //prepare for update backend
                var vOdataKey = oBindingContext.getModel("sflight").getProperty(vPath)["Key"];
                var oS4TObject = evt.getSource().getModel("S4TOData").getProperty("/"+vOdataKey);
                oS4TObject["Currency"] = vNewCurr;
                this.sflightUpdate.push(oS4TObject);
            },
            onUpdate(evt){
                var that = this;
                this.updLoop = this.sflightUpdate;
                this.sflightUpdate = [];
                for(let i=0;i<this.updLoop.length;i++){
                    //this.getView().setBusy(true);
                    var vJsonDate = this.updLoop[i].Fldate.toJSON();
                    var vFldate = vJsonDate.split(".")[0];
                    var oBackendUpdate = {
                        Carrid : this.updLoop[i].Carrid,
                        Connid: this.updLoop[i].Connid,
                        Fldate: vFldate,
                        Currency: this.updLoop[i].Currency
                    };
                    this.getView().getModel("S4TOData").update("/"+this.updLoop[i].Key, oBackendUpdate, {
                        async:false,
                        success: function(ok){
                            Message.show("OK");
                            that.getView().setBusy(false);
                            that.refreshSflight();
                        },
                        error: function(ko){
                            Message.show("KO");
                            that.getView().setBusy(false);
                            that.sflightUpdate.push(that.updLoop[i])
                        }
                    })
                }
                
            },
            onDelete(evt){
                var that = this;
                var delLoop = this.getView().byId("flights").getSelectedItems();
                for(let i=0;i<delLoop.length;i++){
                    //this.getView().setBusy(true);
                    var vPath = delLoop[i].getBindingContext("sflight").getPath();
                    var vKey = this.getView().getModel("sflight").getProperty(vPath).Key;
                    var vInd = vKey.split("/")[1];
                    this.getView().getModel("S4TOData").remove("/"+vKey, {
                        async:false,
                        success: function(ok){
                            Message.show("OK");
                            that.getView().setBusy(false);
                            let oModel = that.getView().getModel("sflight");
                            that.refreshSflight();
                            oModel.refresh();
                            ;
                        },
                        error: function(ko){
                            Message.show("KO");
                            that.getView().setBusy(false);
                        }
                    })
                }
            },
            onCreate(evt){
                if(!this.oDialog){
                this.onOpenDialog();    
                }else{
                    this.oDialog.open();
                }
            },

            onDateChange(evt){
                try{
                    evt.getSource().setValueState(sap.ui.core.ValueState.None);
                    models.getJSONDate(evt.getSource().getValue());
                }catch(error){
                    evt.getSource().setValueState(sap.ui.core.ValueState.Error);
            }
            },

            onSave(evt){
                var oSflight = {};
                var popupContent = evt.getSource().getParent().getContent();
                var aInput = evt.getSource().getParent().getAggregation("content").filter((line)=> {return line.getAccessibilityInfo()["type"] === "Input"});
                if(aInput.find((line)=>{return line.getValueState() !== 'None'}) !== undefined){
                    Message.show("Campi con errori. Correggere");
                    return;
                }
                oSflight["Carrid"] = this.oSpfliKey.Carrid;
                oSflight["Connid"] = this.oSpfliKey.Connid;

                oSflight["Fldate"] = models.getJSONDate(popupContent[0].getValue());


                oSflight["Price"] = popupContent[1].getValue().replace(",",".");

                oSflight["Seatsmax"] = Number(popupContent[2].getValue());

                oSflight["Seatsocc"] = Number(popupContent[3].getValue());

                var aSflight = [];
                aSflight.push(oSflight);
                var vKey = "/SflightSet";
                    //(Carrid='"+this.oSpfliKey.Carrid+"',Connid='"+this.oSpfliKey.Connid+"',Fldate=datetime'"+encodeURIComponent(oSflight["Fldate"])+"')";

                var that = this;
                this.getView().getModel("S4TOData").create(vKey, oSflight, {
                   success: function(data){
                        Message.show("OK");
                        that.refreshSflight();
                    },
                    error: function(data){
                        Message.show("KO");
                    }
                })
                this.oDialog.close();
            },
            onCancel(evt){
                this.oDialog.close();
            },

            onOverPrice(oThis, eMouseOver) {
                var tId = eMouseOver.srcControl.getParent().getId().split("-");
                var vPath = "/"+tId[tId.length - 1];
                var oValue = {
                    value: Number(this.getView().getModel("sflight").getProperty(vPath).Paymentsum).toLocaleString(
                        undefined, {
                            style: "currency", 
                            currency: this.getView().getModel("sflight").getProperty(vPath).Currency
                        })
                };
                this.getView().setModel(new JSONModel(oValue), "PaymentSum");

                if(!this.oPopover){
                    this.onOpenPopover(eMouseOver.target, oValue);
                }else{
                    //this.oPopover.getAggregation("content")[0].setText(oValue);
                    this.oPopover.openBy(eMouseOver.target);
                }
            },

            onMouseOut(oThis, eMouseOver){
                if(this.oPopover){
                    this.oPopover.close();
                }
            },
            
            refreshSflight(){
                var that = this;

                var aSelItems = this.getView().byId("flights").getSelectedItems();
                aSelItems.forEach((item)=>{
                    item.setSelected(false);
                    var cells = item.getCells();
                    var cell = cells.find((cellParam) => {
                        return cellParam.mProperties.name === 'iCurr'
                    });
                    cell.setEnabled(false);
                });

                //filters
                var aFilter = [];
                aFilter.push(models.createFilter("Carrid",models.OP.eq,this.oSpfliKey.Carrid));
                aFilter.push(models.createFilter("Connid",models.OP.eq,this.oSpfliKey.Connid));

                this.getView().getModel("S4TOData").read("/SflightSet",{
                    filters:aFilter,
                    success:function(oData){
                        for(let i = 0;i<oData.results.length;i++){
                            oData.results[i].FlDate = new Date(oData.results[i].Fldate).toLocaleDateString();
                            oData.results[i].AvSeats = oData.results[i].Seatsmax - oData.results[i].Seatsocc;
                            oData.results[i].Key = "SflightSet(Carrid='"+oData.results[i].Carrid +
                                                            "',Connid='"+oData.results[i].Connid +
                                                            "',Fldate=datetime'"+encodeURIComponent(models.getJSONDate(oData.results[i].FlDate))
                                                            +"')";
                            that.getView().getModel("S4TOData").setProperty("/"+oData.results[i].Key+"/Key",oData.results[i].Key);
                            that.getView().getModel("S4TOData").setProperty("/"+oData.results[i].Key+"/FlDate",oData.results[i].FlDate);
                            that.getView().getModel("S4TOData").setProperty("/"+oData.results[i].Key+"/AvSeats",oData.results[i].AvSeats);
                        }
                        that.getView().setModel(new JSONModel(oData.results), "sflight");
                        that.getView().getModel("sflight").refresh();
                    },
                    error: function(error){
                        Message.show("KO");
                    }
                })
            },

            onItemPress(evt){
                var tId = evt.getParameter("id").split("-");
                var vPath = "/"+tId[tId.length - 1];
                let oLine = evt.getSource().getModel("sflight").getProperty(vPath);
                let aFilter = [];
                aFilter.push( models.createFilter("Carrid", models.OP.eq, oLine.Carrid));
                aFilter.push( models.createFilter("Connid", models.OP.eq, oLine.Connid));
                aFilter.push( models.createFilter("Fldate", models.OP.eq, oLine.Fldate));
                let that = this;
                this.getView().getModel("S4TOData").read("/zFlSbook",{
                    async:false,
                    filters: aFilter,
                    success: function(oData){
                        that.getView().setModel(new JSONModel(oLine), "selFlight");
                        that.getView().setModel(new JSONModel(oData.results), "sbook");
                    },
                    error:function(err){
                        Message.show("KO");
                    }
                })
                this.byId("splitApp").to(this.createId("bookings"));
            },

            onBackToFlights(){
                this.byId("splitApp").to(this.createId("connectionFlights"));
            },

            onCustomerIdPress: function(evt){
                let vCustomId = evt.getSource().getText();
                let that = this;
                if(!this.oPopoverCustomer){
                    this.oPopoverCustomer = new sap.m.Popover(undefined, {
                        modal: false,
                        title: "Customer Information",
                        placement: sap.m.PlacementType.PreferredTopOrFlip
                    })

                }

                this.oPopoverCustomer.destroyContent();
                this.oPopoverCustomer.addContent(new sap.m.Text(undefined, {
                    text: "Customer ID: " + vCustomId,
                }));
                this.getView().getModel("S4TOData").read("/zFlScustom(CustomerId='"+vCustomId+"')",{

                    success:function(oData){
                        let oPopOver = that.oPopoverCustomer;
                        oPopOver.setModel(new JSONModel(oData), "customer");
                        that.onOpenCustPopov(that, evt);
                    },
                    error:function(err){
                        Message.show("KO");
                    }
                })
            },

            toCustomer(evt){
                let vPath = evt.getSource().getBindingContext("sbook").getPath();
                var vSbook = evt.getSource().getModel("sbook").getProperty(vPath);
                var vCustomId = vSbook["Customid"];
                this.getOwnerComponent().setModel(new JSONModel(vSbook), "selSBookToCustomer" )
                this.getOwnerComponent().getRouter().navTo("RouteCustomer", { Customer: vCustomId });
            },
            //async functions
            async onOpenDialog(){
                this.oDialog ??= await this.loadFragment({name:"s4tairlines.s4tairlines.fragments.popup"});
                this.oDialog.open();
            },

            async onOpenPopover(target, oText){
                this.oPopover ??= await this.loadFragment({name:"s4tairlines.s4tairlines.fragments.popover"});
                //this.oPopover.getAggregation("content")[0].setText(oText);
                this.oPopover.openBy(target);
            },
            async onOpenCustPopov(oThis, oEvt){
                let oFragm = await oThis.loadFragment({name:"s4tairlines.s4tairlines.fragments.popovCust"});
                oFragm.forEach(function(element){
                    oThis.oPopoverCustomer.addContent(element);
                });
                
                oThis.oPopoverCustomer.openBy(oEvt.getSource());

            }
        })
}) 