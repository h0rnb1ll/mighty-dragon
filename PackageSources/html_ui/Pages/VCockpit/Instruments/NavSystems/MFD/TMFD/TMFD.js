class TMFD extends AS3000_TSC {
    constructor() {
        super();
        this.pfdPrefix = "PMFD_1";
    }
    get templateID() { return "TMFD"; }
    connectedCallback() {
        NavSystemTouch.prototype.connectedCallback.call(this);
        this.pagesContainer = this.getChildById("PagesDisplay");
        this.pageTitle = this.getChildById("PageTitle");
        this.pageGroups = [
            new NavSystemPageGroup("PMFD", this, [
                new NavSystemPage("PMFD Home", "PFDHome", new TMFD_PFDHome()),
                new NavSystemPage("Speed Bugs", "SpeedBugs", this.speedBugs),
                new NavSystemPage("Timers", "Timers", this.timer),
                new NavSystemPage("Minimums", "Minimums", new TMFD_Minimums()),
            ]),
            new NavSystemPageGroup("SMFD", this, [
                new NavSystemPage("SMFD Home", "MFDHome", new TMFD_MFDHome()),
                new NavSystemPage("Direct To", "DirectTo", new TMFD_DirectTo()),
                new NavSystemPage("Active Flight Plan", "ActiveFlightPlan", new TMFD_ActiveFPL()),
                new NavSystemPage("Procedures", "Procedures", new TMFD_Procedures()),
                new NavSystemPage("Departure Selection", "DepartureSelection", new TMFD_DepartureSelection()),
                new NavSystemPage("Arrival Selection", "ArrivalSelection", new TMFD_ArrivalSelection()),
                new NavSystemPage("Approach Selection", "ApproachSelection", new TMFD_ApproachSelection()),
                new NavSystemPage("Waypoint Info", "WaypointsInfo", new TMFD_WaypointInfo()),
                new NavSystemPage("Airport Info", "AirportInfo", new TMFD_AirportInfo()),
                new NavSystemPage("Nearest", "Nearest", new TMFD_NRST()),
                new NavSystemPage("Nearest Airport", "NearestAirport", new TMFD_NRST_Airport()),
                new NavSystemPage("Nearest Intersection", "NearestIntersection", new TMFD_NRST_Intersection()),
                new NavSystemPage("Nearest VOR", "NearestVOR", new TMFD_NRST_VOR()),
                new NavSystemPage("Nearest NDB", "NearestNDB", new TMFD_NRST_NDB()),
                new NavSystemPage("Speed Bugs", "SpeedBugs", this.speedBugs),
            ]),
            new NavSystemPageGroup("NavCom", this, [
                new NavSystemPage("NAV/COM Home", "NavComHome", new TMFD_NavComHome()),
            ]),
        ];
        this.navButtons = [
            new AS3000_TSC_NavButton("NavBar_1", this),
            new AS3000_TSC_NavButton("NavBar_2", this),
            new AS3000_TSC_NavButton("NavBar_3", this),
            new AS3000_TSC_NavButton("NavBar_4", this),
            new AS3000_TSC_NavButton("NavBar_5", this),
            new AS3000_TSC_NavButton("NavBar_6", this)
        ];
        this.transponderWindow = new NavSystemElementContainer("Transponder", "TransponderWindow", new AS3000_TSC_Transponder());
        this.transponderWindow.setGPS(this);
        this.audioRadioWindow = new NavSystemElementContainer("Audio & Radios", "AudioRadiosWindow", new TMFD_AudioRadios());
        this.audioRadioWindow.setGPS(this);
        this.frequencyKeyboard = new NavSystemElementContainer("Frequency Keyboard", "frequencyKeyboard", new AS3000_TSC_FrequencyKeyboard());
        this.frequencyKeyboard.setGPS(this);
        this.adfFrequencyKeyboard = new NavSystemElementContainer("ADF Frequency Keyboard", "frequencyKeyboard", new AS3000_TSC_ADFFrequencyKeyboard());
        this.adfFrequencyKeyboard.setGPS(this);
        this.timeKeyboard = new NavSystemElementContainer("Time Keyboard", "timeKeyboard", new AS3000_TSC_TimeKeyboard());
        this.timeKeyboard.setGPS(this);
        this.speedKeyboard = new NavSystemElementContainer("Speed Keyboard", "speedKeyboard", new AS3000_TSC_SpeedKeyboard());
        this.speedKeyboard.setGPS(this);
        this.fullKeyboard = new NavSystemElementContainer("Keyboard", "fullKeyboard", new TMFD_FullKeyboard());
        this.fullKeyboard.setGPS(this);
        this.insertBeforeWaypoint = new NavSystemElementContainer("Insert Before Waypoint", "insertBeforeWaypointWindow", new TMFD_InsertBeforeWaypoint());
        this.insertBeforeWaypoint.setGPS(this);
        this.minimumSource = new NavSystemElementContainer("Minimums Source", "minimumSource", new AS3000_TSC_MinimumSource());
        this.minimumSource.setGPS(this);
        this.mapOrientationPopup = new NavSystemElementContainer("Map Orientation", "MapOrientationPopup", new AS3000_TSC_MapOrientationPopup());
        this.mapOrientationPopup.setGPS(this);
        this.duplicateWaypointSelection = new NavSystemElementContainer("Waypoint Duplicates", "WaypointDuplicateWindow", new TMFD_DuplicateWaypointSelection());
        this.duplicateWaypointSelection.setGPS(this);
        this.loadFrequencyWindow = new NavSystemElementContainer("Frequency Window", "LoadFrequencyPopup", new AS3000_TSC_LoadFrequencyWindow());
        this.loadFrequencyWindow.setGPS(this);
        this.waypointOptions = new NavSystemElementContainer("Waypoint Options", "WaypointInfo_WaypointOptions", new TMFD_WaypointOptions());
        this.waypointOptions.setGPS(this);
        this.mapPointerControl = new NavSystemElementContainer("Map Pointer Control", "MapPointerControl", new TMFD_MapPointerControl());
        this.mapPointerControl.setGPS(this);
        this.confirmationWindow = new AS3000_TSC_ConfirmationWindow();
        this.terrainAlerts = new AS3000_TSC_TerrainAlert();
        this.addIndependentElementContainer(new NavSystemElementContainer("Terrain Alert", "terrainAlert", this.terrainAlerts));
        this.addIndependentElementContainer(new NavSystemElementContainer("Confirmation Window", "ConfirmationWindow", this.confirmationWindow));
        SimVar.SetSimVarValue("L:AS3000_Brightness_Manual", "number", 1);
    }
    parseXMLConfig() {
        super.parseXMLConfig();
        let pfdPrefix_elem = this.xmlConfig.getElementsByTagName("PMFD_1");
        if (pfdPrefix_elem.length > 0) {
            this.pfdPrefix = pfdPrefix_elem[0].textContent;
        }
    }
    onUpdate() {
        let title = this.getCurrentPage().name;
        this.pageTitle.innerHTML = title;
        SimVar.SetSimVarValue("L:TMFD_" + this.urlConfig.index + "_Timer_Value", "number", this.timer.getCurrentDisplay());
    }
    onEvent(_event) {
        super.onEvent(_event);
		console.log(_event);
        switch (_event) {
            case "SOFTKEYS_1":
                this.SwitchToPageName("PMFD", "PMFD Home");
                this.closePopUpElement();
                this.history = [];
                break;
            case "SOFTKEYS_2":
                this.SwitchToPageName("SMFD", "SMFD Home");
                this.closePopUpElement();
                this.history = [];
                break;
            case "SOFTKEYS_3":
                this.SwitchToMenuName("NavCom");
                this.closePopUpElement();
                this.history = [];
                break;
        }
        if (this.getCurrentPageGroup().name == "SMFD" && this.popUpElement != this.mapPointerControl) {
            switch (_event) {
                case "BottomKnob_Small_INC":
                    LaunchFlowEvent("ON_MOUSERECT_HTMLEVENT", "AS3000_MFD_RNG_Dezoom");
                    break;
                case "BottomKnob_Small_DEC":
                    LaunchFlowEvent("ON_MOUSERECT_HTMLEVENT", "AS3000_MFD_RNG_Zoom");
                    break;
                case "BottomKnob_Push":
                    this.switchToPopUpPage(this.mapPointerControl);
                    break;
            }
        }
    }
    setTopKnobText(_text, _fromPopUp = false) {
    }
    setBottomKnobText(_text, _fromPopUp = false) {
    }
    rollBackKnobTexts() {
    }
    closePopUpElement() {
        super.closePopUpElement();
    }
}
registerInstrument("tmfd-element", TMFD);
class TMFD_PFDHome extends AS3000_TSC_PFDHome {
    init(root) {
        this.OBSButton = this.gps.getChildById("OBSButton");
        this.CASUpButton = this.gps.getChildById("CASUpButton");
        this.Bearing1Button = this.gps.getChildById("Bearing1Button");
        this.Bearing1Button_Value = this.Bearing1Button.getElementsByClassName("lowerValue")[0];
        this.Bearing2Button = this.gps.getChildById("Bearing2Button");
        this.Bearing2Button_Value = this.Bearing2Button.getElementsByClassName("lowerValue")[0];
        this.CASDownButton = this.gps.getChildById("CASDownButton");
        this.SpeedBugsButton = this.gps.getChildById("SpeedBugsButton_PFD");
        this.TimersButton = this.gps.getChildById("TimersButton");
        this.MinimumsButton = this.gps.getChildById("MinimumsButton");
        this.TrafficMapButton = this.gps.getChildById("TrafficMapButton");
        this.PFDMapSettingsButton = this.gps.getChildById("PFDMapSettingsButton");
        this.SensorsButton = this.gps.getChildById("SensorsButton");
        this.gps.makeButton(this.Bearing1Button, this.sendMouseEvent.bind(this.gps, this.gps.pfdPrefix + "_BRG1Switch"));
        this.gps.makeButton(this.Bearing2Button, this.sendMouseEvent.bind(this.gps, this.gps.pfdPrefix + "_BRG2Switch"));
        this.gps.makeButton(this.SpeedBugsButton, this.gps.SwitchToPageName.bind(this.gps, "PMFD", "Speed Bugs"));
        this.gps.makeButton(this.TimersButton, this.gps.SwitchToPageName.bind(this.gps, "PMFD", "Timers"));
        this.gps.makeButton(this.MinimumsButton, this.gps.SwitchToPageName.bind(this.gps, "PMFD", "Minimums"));
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        let brg1Src = SimVar.GetSimVarValue("L:PFD_BRG1_Source", "number");
        switch (brg1Src) {
            case 0:
                this.Bearing1Button_Value.textContent = "OFF";
                break;
            case 1:
                this.Bearing1Button_Value.textContent = "NAV1";
                break;
            case 2:
                this.Bearing1Button_Value.textContent = "NAV2";
                break;
            case 3:
                this.Bearing1Button_Value.textContent = "GPS";
                break;
            case 4:
                this.Bearing1Button_Value.textContent = "ADF";
                break;
        }
        let brg2Src = SimVar.GetSimVarValue("L:PFD_BRG2_Source", "number");
        switch (brg2Src) {
            case 0:
                this.Bearing2Button_Value.textContent = "OFF";
                break;
            case 1:
                this.Bearing2Button_Value.textContent = "NAV1";
                break;
            case 2:
                this.Bearing2Button_Value.textContent = "NAV2";
                break;
            case 3:
                this.Bearing2Button_Value.textContent = "GPS";
                break;
            case 4:
                this.Bearing2Button_Value.textContent = "ADF";
                break;
        }
    }
    onExit() {
    }
    onEvent(_event) {
    }
    sendMouseEvent(_event) {
        LaunchFlowEvent("ON_MOUSERECT_HTMLEVENT", _event);
    }
}
class TMFD_MFDHome extends AS3000_TSC_MFDHome {
    init(root) {
        this.directToButton = this.gps.getChildById("DirectToButton");
        this.FlightPlanButton = this.gps.getChildById("FlightPlanButton");
        this.procButton = this.gps.getChildById("ProcButton");
        this.NearestButton = this.gps.getChildById("NearestButton");
        this.speedBugsButton = this.gps.getChildById("SpeedBugsButton_MFD");
        this.WaypointsInfoButton = this.gps.getChildById("WaypointInfoButton");
        this.AircraftSystemsButton = this.gps.getChildById("AircraftSystemsButton");
        this.gps.makeButton(this.directToButton, this.gps.SwitchToPageName.bind(this.gps, "SMFD", "Direct To"));
        this.gps.makeButton(this.FlightPlanButton, this.gps.SwitchToPageName.bind(this.gps, "SMFD", "Active Flight Plan"));
        this.gps.makeButton(this.procButton, this.gps.SwitchToPageName.bind(this.gps, "SMFD", "Procedures"));
        this.gps.makeButton(this.NearestButton, this.gps.SwitchToPageName.bind(this.gps, "SMFD", "Nearest"));
        this.gps.makeButton(this.speedBugsButton, this.gps.SwitchToPageName.bind(this.gps, "SMFD", "Speed Bugs"));
        this.gps.makeButton(this.WaypointsInfoButton, this.gps.SwitchToPageName.bind(this.gps, "SMFD", "Waypoint Info"));
        this.gps.makeButton(this.AircraftSystemsButton, this.gps.SwitchToPageName.bind(this.gps, "SMFD", "Aircraft Systems"));
    }
    mapSwitch(_mapIndex) {
    }
}
class TMFD_WeatherSelection extends AS3000_TSC_WeatherSelection {
    backHome() {
        this.gps.SwitchToPageName("SMFD", "SMFD Home");
    }
}
class TMFD_DirectTo extends AS3000_TSC_DirectTo {
    onEnter() {
        super.onEnter();
        this.gps.activateNavButton(1, "Cancel", this.gps.goBack.bind(this.gps), false, "Icons/ICON_MAP_BUTTONBAR_BACK_1.png");
        this.gps.activateNavButton(2, "Home", this.backHome.bind(this), false, "Icons/ICON_MAP_BUTTONBAR_HOME.png");
    }
    backHome() {
        this.gps.SwitchToPageName("SMFD", "SMFD Home");
    }
}
class TMFD_ActiveFPL extends AS3000_TSC_ActiveFPL {
    originClick() {
        if (this.gps.currFlightPlanManager.getWaypointsCount() < 1 || !SimVar.GetSimVarValue("L:Glasscockpits_FPLHaveOrigin", "boolean")) {
            this.gps.getFullKeyboard().getElementOfType(TMFD_FullKeyboard).setContext(this.insertOriginEndKeyboard.bind(this));
            this.gps.switchToPopUpPage(this.gps.getFullKeyboard());
        }
        else {
            if (this.currentMenu == 3) {
                this.closeMenu();
                this.origin.setAttribute("state", "");
            }
            else {
                this.unselectLastButton();
                this.origin.setAttribute("state", "SelectedWP");
                this.flightPlanDiv.setAttribute("displayedMenu", "Origin");
                this.currentMenu = 3;
                this.selectedWaypoint = -1;
                this.updateMenu();
            }
        }
    }
    onEnter() {
        super.onEnter();
        this.gps.activateNavButton(1, "Back", this.back.bind(this), false, "Icons/ICON_MAP_BUTTONBAR_BACK_1.png");
        this.gps.activateNavButton(2, "Home", this.backHome.bind(this), false, "Icons/ICON_MAP_BUTTONBAR_HOME.png");
        this.gps.activateNavButton(5, "Up", this.scrollUp.bind(this), false, "Icons/ICON_MAP_CB_UP_ARROW_1.png");
        this.gps.activateNavButton(6, "Down", this.scrollDown.bind(this), false, "Icons/ICON_MAP_CB_DOWN_ARROW_1.png");
    }
    onExit() {
        super.onExit();
        this.gps.deactivateNavButton(1, false);
        this.gps.deactivateNavButton(2, false);
        this.gps.deactivateNavButton(5, false);
        this.gps.deactivateNavButton(6, false);
    }
    back() {
        this.gps.goBack();
    }
    backHome() {
        this.gps.SwitchToPageName("SMFD", "SMFD Home");
    }
}
class TMFD_Procedures extends AS3000_TSC_Procedures {
    backHome() {
        this.gps.SwitchToPageName("SMFD", "SMFD Home");
    }
}
class TMFD_DepartureSelection extends AS3000_TSC_DepartureSelection {
    backHome() {
        this.gps.SwitchToPageName("SMFD", "SMFD Home");
    }
    close() {
        this.gps.SwitchToPageName("SMFD", "Procedures");
    }
}
class TMFD_ArrivalSelection extends AS3000_TSC_ArrivalSelection {
    backHome() {
        this.gps.SwitchToPageName("SMFD", "SMFD Home");
    }
    close() {
        this.gps.SwitchToPageName("SMFD", "Procedures");
    }
}
class TMFD_ApproachSelection extends AS3000_TSC_ApproachSelection {
    backHome() {
        this.gps.SwitchToPageName("SMFD", "SMFD Home");
    }
    close() {
        this.gps.SwitchToPageName("SMFD", "Procedures");
    }
}
class TMFD_WaypointInfo extends AS3000_TSC_WaypointInfo {
    init(root) {
        this.airportBtn = this.gps.getChildById("WPInfoAirport_Btn");
        this.intBtn = this.gps.getChildById("WPInfoINT_Btn");
        this.vorBtn = this.gps.getChildById("WPInfoVOR_Btn");
        this.ndbBtn = this.gps.getChildById("WPInfoNDB_Btn");
        this.gps.makeButton(this.airportBtn, this.gps.SwitchToPageName.bind(this.gps, "SMFD", "Airport Info"));
    }
    backHome() {
        this.gps.SwitchToPageName("SMFD", "SMFD Home");
        this.gps.closePopUpElement();
        return true;
    }
}
class TMFD_AirportInfo extends AS3000_TSC_AirportInfo {
    backHome() {
        this.gps.SwitchToPageName("SMFD", "SMFD Home");
        this.gps.closePopUpElement();
        return true;
    }
}
class TMFD_NRST extends AS3000_TSC_NRST {
    init(root) {
        this.Airport = this.gps.getChildById("NrstAirport_Btn");
        this.INT = this.gps.getChildById("NrstInt_Btn");
        this.VOR = this.gps.getChildById("NrstVor_Btn");
        this.NDB = this.gps.getChildById("NrstNdb_Btn");
        this.User = this.gps.getChildById("NrstUser_Btn");
        this.Airspace = this.gps.getChildById("NrstAirspace_Btn");
        this.ARTCC = this.gps.getChildById("NrstARTCC_Btn");
        this.FSS = this.gps.getChildById("NrstFSS_Btn");
        this.Weather = this.gps.getChildById("NrstWeather_Btn");
        this.gps.makeButton(this.Airport, this.gps.SwitchToPageName.bind(this.gps, "SMFD", "Nearest Airport"));
        this.gps.makeButton(this.INT, this.gps.SwitchToPageName.bind(this.gps, "SMFD", "Nearest Intersection"));
        this.gps.makeButton(this.VOR, this.gps.SwitchToPageName.bind(this.gps, "SMFD", "Nearest VOR"));
        this.gps.makeButton(this.NDB, this.gps.SwitchToPageName.bind(this.gps, "SMFD", "Nearest NDB"));
    }
    onEnter() {
        this.gps.activateNavButton(1, "Back", this.back.bind(this), false, "Icons/ICON_MAP_BUTTONBAR_BACK_1.png");
        this.gps.activateNavButton(2, "Home", this.backHome.bind(this), false, "Icons/ICON_MAP_BUTTONBAR_HOME.png");
    }
    onUpdate(_deltaTime) {
    }
    onExit() {
        this.gps.deactivateNavButton(1, false);
        this.gps.deactivateNavButton(2, false);
    }
    onEvent(_event) {
    }
    back() {
        this.gps.goBack();
        return true;
    }
    backHome() {
        this.gps.SwitchToPageName("SMFD", "SMFD Home");
        this.gps.closePopUpElement();
        return true;
    }
}
class TMFD_NRST_Airport extends AS3000_TSC_NRST_Airport {
    backHome() {
        this.gps.SwitchToPageName("SMFD", "SMFD Home");
        this.gps.closePopUpElement();
        return true;
    }
    directTo() {
        this.gps.lastRelevantICAO = this.nearestAirports.airports[this.selectedElement].icao;
        this.gps.lastRelevantICAOType = this.nearestAirports.airports[this.selectedElement].type;
        this.gps.SwitchToPageName("SMFD", "Direct To");
    }
    insertInFplIndexSelectionCallback(_index) {
        this.gps.currFlightPlanManager.addWaypoint(this.nearestAirports.airports[this.selectedElement].icao, _index, () => {
            this.gps.currFlightPlanManager.updateFlightPlan();
            this.gps.SwitchToPageName("SMFD", "Active Flight Plan");
        });
    }
    airportInfo() {
        this.gps.SwitchToPageName("SMFD", "Airport Info");
    }
}
class TMFD_NRST_Intersection extends AS3000_TSC_NRST_Intersection {
    backHome() {
        this.gps.SwitchToPageName("SMFD", "SMFD Home");
        this.gps.closePopUpElement();
        return true;
    }
}
class TMFD_NRST_VOR extends AS3000_TSC_NRST_VOR {
    backHome() {
        this.gps.SwitchToPageName("SMFD", "SMFD Home");
        this.gps.closePopUpElement();
        return true;
    }
}
class TMFD_NRST_NDB extends AS3000_TSC_NRST_NDB {
    backHome() {
        this.gps.SwitchToPageName("SMFD", "SMFD Home");
        this.gps.closePopUpElement();
        return true;
    }
}
class TMFD_NavComHome extends AS3000_TSC_NavComHome {
    setSoftkeysNames() {
    }
}
class TMFD_AudioRadios extends AS3000_TSC_AudioRadios {
    setSelectedLine(_index) {
        this.lines[this.selectedLine].lineElement.setAttribute("state", "");
        this.selectedLine = _index;
        this.lines[this.selectedLine].lineElement.setAttribute("state", "Selected");
    }
}
class TMFD_FullKeyboard extends AS3000_TSC_FullKeyboard {
    onEnter() {
        this.window.setAttribute("state", "Active");
        this.currentValue = ["_", "_", "_", "_", "_", "_"];
        this.displayedValue = "______";
        this.currentIndex = -1;
        this.needUpdate = true;
        console.log("Test FullKeyboard");
        this.gps.activateNavButton(1, "Back", this.cancel.bind(this), true, "Icons/ICON_MAP_BUTTONBAR_BACK_1.png");
        this.gps.activateNavButton(2, "Home", this.backHome.bind(this), true, "Icons/ICON_MAP_BUTTONBAR_HOME.png");
        this.gps.deactivateNavButton(3, false);
        this.gps.deactivateNavButton(4, false);
        this.gps.deactivateNavButton(5, false);
        this.gps.activateNavButton(6, "Enter", this.validate.bind(this), true, "Icons/ICON_MAP_ENTER.png");
    }
    backHome() {
        this.gps.SwitchToPageName("SMFD", "SMFD Home");
        this.gps.closePopUpElement();
        return true;
    }
}
class TMFD_InsertBeforeWaypoint extends AS3000_TSC_InsertBeforeWaypoint {
    backHome() {
        this.gps.SwitchToPageName("SMFD", "SMFD Home");
        this.gps.closePopUpElement();
        return true;
    }
}
class TMFD_DuplicateWaypointSelection extends AS3000_TSC_DuplicateWaypointSelection {
    backHome() {
        this.gps.SwitchToPageName("SMFD", "SMFD Home");
        this.gps.closePopUpElement();
        return true;
    }
}
class TMFD_Minimums extends AS3000_TSC_Minimums {
    backHome() {
        this.gps.SwitchToPageName("PMFD", "PMFD Home");
    }
}
class TMFD_WaypointOptions extends AS3000_TSC_WaypointOptions {
    directTo() {
        this.gps.closePopUpElement();
        this.gps.SwitchToPageName("SMFD", "Direct To");
    }
    insertInFpl() {
        this.gps.closePopUpElement();
        this.gps.insertBeforeWaypoint.getElementOfType(TMFD_InsertBeforeWaypoint).setContext(this.insertInFplIndexSelectionCallback.bind(this));
        this.gps.switchToPopUpPage(this.gps.insertBeforeWaypoint);
    }
    insertInFplIndexSelectionCallback(_index) {
        SimVar.SetSimVarValue("C:fs9gps:FlightPlanNewWaypointICAO", "string", this.icao);
        SimVar.SetSimVarValue("C:fs9gps:FlightPlanAddWaypoint", "number", _index).then(function () {
            this.gps.currFlightPlanManager.updateFlightPlan();
            this.gps.SwitchToPageName("SMFD", "Active Flight Plan");
        }.bind(this));
    }
}
class TMFD_MapPointerControl extends AS3000_MapPointerControl {
    backHome() {
        this.gps.closePopUpElement();
        this.gps.SwitchToPageName("SMFD", "SMFD Home");
    }
}
//# sourceMappingURL=TMFD.js.map