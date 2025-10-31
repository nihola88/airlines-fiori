# airlines-fiori
Fiori App exploiting SAP flights Demo tables

This simple App is an example of various Fiori functionalities/Views, based on the SAP Demo tables SCARR, SPFLI, SBOOK, SCUSTOMER, etc.
  1. The Home Page (App.view.xml) shows a series of Tiles, plus a ChartContainer with stats on the seats occupation in flights
     a. The language Select shows The Text language and flag Icon as .png obtained from a web url
     b. At the load of the App, Odata is extracted immediately and saved in a model
  
  2. The Airlines.view.xml is a normal Table with fields displayed as Text, Link, Button, and Text Area
     a. The click on the Button brings to Flights view Connections.view.xml
  
  3. 
