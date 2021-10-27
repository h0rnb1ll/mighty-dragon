const lbl_on = "开启";
const lbl_off = "关闭";
const lbl_open = "打开";
const lbl_shut = "关闭";
const lbl_auto = "自动";
const lbl_mach = "MACH";
const lbl_airspeed = "AIRSPD";
const lbl_full = "全面";
const lbl_low = "低";
const lbl_medium = "中";
const lbl_high = "高";
const lbl_ultra = "超";
const lbl_hidden = "隐藏";
const lbl_disabled = "禁用";
class PMFD extends NavSystem {
    constructor() {
        super();
        this.handleReversionaryMode = false;
        this.initDuration = 7000;
    }
    get IsGlassCockpit() { return true; }
    get templateID() { return "PMFD"; }
    connectedCallback() {
        super.connectedCallback();
        this.mainPage = new PMFD_MainPage();
        this.pageGroups = [
            new NavSystemPageGroup("Main", this, [
                this.mainPage
            ]),
        ];
        this.maxUpdateBudget = 12;
        SimVar.SetSimVarValue("L:XMLVAR_EBD_PMFD_QUALITY", "number", 3);
        SimVar.SetSimVarValue("L:XMLVAR_EBD_HUD_FD", "boolean", false);
        this.warnings = new PFD_Warnings();
        this.addIndependentElementContainer(new NavSystemElementContainer("WindData", "WindData", new PFD_WindData()));
        this.addIndependentElementContainer(new NavSystemElementContainer("Warnings", "Warnings", this.warnings));
        this.addIndependentElementContainer(new NavSystemElementContainer("SoftKeys", "SoftKeys", new TwentySoftKeys(PMFD_SoftKeyHtmlElement)));
        
    }
    disconnectedCallback() {
        super.disconnectedCallback();
    }
    CanUpdate() {
        super.CanUpdate();
        var quality; // = Quality.medium;
        var qualityInt = parseInt(SimVar.GetSimVarValue("L:XMLVAR_EBD_PMFD_QUALITY", "number"));
        switch (qualityInt) {
            case 5:
                quality = Quality.ultra;
                break;
            case 4:
                quality = Quality.high;
                break;
            case 3:
                quality = Quality.medium;
                break;
            case 2:
                quality = Quality.low;
                break;
            case 1:
                quality = Quality.hidden;
                break;
            case 0:
                quality = Quality.disabled;
                break;
        }
        if (quality == Quality.ultra) {
            return true;
        }
        else if (quality == Quality.high) {
            if ((this.frameCount % 2) != 0) {
                return false;
            }
        }
        else if (quality == Quality.medium) {
            if ((this.frameCount % 4) != 0) {
                return false;
            }
        }
        else if (quality == Quality.low) {
            if ((this.frameCount % 32) != 0) {
                return false;
            }
        }
        else if (quality == Quality.hidden) {
            if ((this.frameCount % 128) != 0) {
                return false;
            }
        }
        else if (quality == Quality.disabled) {
            return false;
        }
        return true;
    }
    parseXMLConfig() {
        super.parseXMLConfig();
        let syntheticVision = null;
        let reversionaryMode = null;
        if (this.instrumentXmlConfig) {
            syntheticVision = this.instrumentXmlConfig.getElementsByTagName("SyntheticVision")[0];
            reversionaryMode = this.instrumentXmlConfig.getElementsByTagName("ReversionaryMode")[0];
        }
        if (!syntheticVision || syntheticVision.textContent == "True") {
            if (this.mainPage.attitude.svg) {
                this.mainPage.attitude.svg.setAttribute("background", "false");
            }
            let syntheticVisDiv = this.getChildById("SyntheticVision");
            if(syntheticVisDiv){
                this.getChildById("SyntheticVision").style.display = "block";
            }
            this.mainPage.syntheticVision = true;
        }
        else {
            if (this.mainPage.attitude.svg) {
                this.mainPage.attitude.svg.setAttribute("background", "true");
            }
            this.getChildById("SyntheticVision").style.display = "none";
            this.mainPage.syntheticVision = false;
        }
        if (reversionaryMode && reversionaryMode.textContent == "True") {
            this.handleReversionaryMode = true;
        }
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        if (this.handleReversionaryMode) {
            this.reversionaryMode = false;
            if (document.body.hasAttribute("reversionary")) {
                var attr = document.body.getAttribute("reversionary");
                if (attr == "true") {
                    this.reversionaryMode = true;
                }
            }
        }
    }
    reboot() {
        super.reboot();
        if (this.warnings)
            this.warnings.reset();
        if (this.mainPage)
            this.mainPage.reset();
    }
}
class PMFD_SoftKeyHtmlElement extends SoftKeyHtmlElement {
    constructor(_elem) {
        super(_elem);
        this.Element = _elem.getElementsByClassName("Title")[0];
        this.ValueElement = _elem.getElementsByClassName("Value")[0];
        this.StatusBar = _elem.getElementsByClassName("Status")[0];
    }
    fillFromElement(_elem) {
        super.fillFromElement(_elem);
        if (_elem.statusBarCallback == null) {
            this.StatusBar.setAttribute("state", "None");
        }
        else {
            if (_elem.statusBarCallback()) {
                this.StatusBar.setAttribute("state", "Active");
            }
            else {
                this.StatusBar.setAttribute("state", "Inactive");
            }
        }
        if (_elem.valueCallback == null) {
            this.ValueElement.textContent = "";
        }
        else {
            this.ValueElement.textContent = _elem.valueCallback();
        }
    }
}
class PMFD_MainPage extends NavSystemPage {
    constructor() {
        super("Main", "Mainframe", new PMFD_MainElement());
        this.bottomKeys = null;
        this.topKeys = null;
        this.horizElem = null;
        this.instrumElem = null;
        this.attitudeElem = null;
        this.horizMapHtmlElem = null;
        this.topMapHtmlElem = null;
        this.alertHtmlElem = null;
        this.syntheticVision = false;
        this.rootMenu = new SoftKeysMenu();
        this.attitude_rootMenu = new SoftKeysMenu();
        this.pageMenu = new SoftKeysMenu();
        this.pfdMenu = new SoftKeysMenu();
        this.hudMenu = new SoftKeysMenu();
        this.otherPfdMenu = new SoftKeysMenu();
        this.windMenu = new SoftKeysMenu();
        this.map_rootMenu = new SoftKeysMenu();
        this.annunciations = new PFD_Annunciations();
        this.attitude = new PFD_Attitude();
        this.horizMapInstrument = null;
        this.topMapInstrument = null;
        this.aoaIndicator = new PMFD_AngleOfAttackIndicator();
		this.pfd_airspeed = new PFD_Airspeed();
        this.compass = new PFD_Compass();
		this.pfd_airspeed.alwaysDisplaySpeed = true;
        this.menuIndex = "1";
        this.smfd1hasMapControl = false;
        this.mapRemoved = false;
        

        this.element = new NavSystemElementGroup([
            this.attitude,
            this.pfd_airspeed
        ]);
    }
    connectedCallback(){
    }
    init() {
        super.init();
		this.bottomKeys = this.gps.getChildById("Bottom");
		this.topKeys = this.gps.getChildById("Top");

        this.attitudeElem= this.gps.getChildById("Horizon");
        this.instrumElem = this.gps.getChildById("InstrumentsContainer");
        this.horizElem = this.gps.getChildById("HorizonContainer");
        this.alertHtmlElem = this.gps.getChildById("StatusAlert");
        this.horizMapHtmlElem = document.createElement("ebd-map-instrument");
        this.horizMapHtmlElem.setAttribute("id", "SyntheticVision");
        this.horizMapHtmlElem.setAttribute("bing-id", "PFD_SyntheticVision");
        this.horizMapHtmlElem.setAttribute("bing-mode", "horizon");
        this.horizMapHtmlElem.setAttribute("show-overlay", "false");
        this.horizMapHtmlElem.setAttribute("config-path", "/Pages/VCockpit/Instruments/NavSystems/AS3000/PFD/");
        this.horizElem.appendChild(this.horizMapHtmlElem);
        this.alertHtmlElem.style.display = "none";
        this.horizMapInstrument = new PMFD_BigMapElement();

        this.element = new NavSystemElementGroup([
            this.attitude,
            this.pfd_airspeed,
            new PMFD_Altimeter(),
            this.annunciations,
            this.compass,
            new PFD_NavStatus(),
            new PMFD_BottomInfos(),
            new PMFD_ActiveCom(),
            new PMFD_ActiveNav(),
            new PMFD_NavStatus(),
            this.aoaIndicator,
            this.horizMapInstrument,
            new PMFD_AutopilotDisplay(),
            new PFD_Minimums(),
            new PFD_RadarAltitude(),
            new PFD_MarkerBeacon()
        ]);

		//console.log("InstrumendID: " + this.gps.instrumentIdentifier);
        this.hsi = this.gps.getChildById("Compass");
        this.wind = this.gps.getChildById("WindData");
        //this.mapInstrument.setGPS(this.gps);
        /*
        if (this.syntheticVision) {
            this.attitude.svg.setAttribute("background", "false");
        }
        else {
            this.attitude.svg.setAttribute("background", "true");
        }
        */
        this.attitude_rootMenu.elements = [
            new PMFD_SoftKeyElement("测试"),
            new PMFD_SoftKeyElement("测试"),
            new PMFD_SoftKeyElement("测试"),
            new PMFD_SoftKeyElement("测试"),
            new PMFD_SoftKeyElement("测试"),
			
            new PMFD_SoftKeyElement("现行NAV", this.gps.computeEvent.bind(this.gps, "SoftKey_CDI"), null, this.navStatus.bind(this)),
            new PMFD_SoftKeyElement("空中交通", null, this.constElement.bind(this, false)),
            new PMFD_SoftKeyElement("页面", this.switchToMenu.bind(this, this.pageMenu)),
            new PMFD_SoftKeyElement("HUD设置", this.switchToMenu.bind(this, this.hudMenu)),
            new PMFD_SoftKeyElement("PFD设置", this.switchToMenu.bind(this, this.pfdMenu))
        ];
        {
            this.hudMenu.elements = [
                new PMFD_SoftKeyElement(""),
                new PMFD_SoftKeyElement(""),
                new PMFD_SoftKeyElement(""),
                new PMFD_SoftKeyElement(""),
                new PMFD_SoftKeyElement(""),
                
                new PMFD_SoftKeyElement("FD", this.toggleHudFD.bind(this), null, this.hudFdStatus.bind(this)),
                new PMFD_SoftKeyElement(""),
                new PMFD_SoftKeyElement(""),
                new PMFD_SoftKeyElement(""),
                new PMFD_SoftKeyElement("返回", this.switchToMenu.bind(this, this.attitude_rootMenu))
            ];
            this.pfdMenu.elements = [
                new PMFD_SoftKeyElement(""),
                new PMFD_SoftKeyElement(""),
                new PMFD_SoftKeyElement(""),
                new PMFD_SoftKeyElement(""),
                new PMFD_SoftKeyElement(""),
                
                new PMFD_SoftKeyElement("PFD模式e", null, null, this.constElement.bind(this, lbl_full)),
                new PMFD_SoftKeyElement("其他PFD选项", this.switchToMenu.bind(this, this.otherPfdMenu)),
                new PMFD_SoftKeyElement("方位1", this.gps.computeEvent.bind(this.gps, "SoftKeys_PFD_BRG1"), null, this.bearing1Status.bind(this)),
                new PMFD_SoftKeyElement("方位2", this.gps.computeEvent.bind(this.gps, "SoftKeys_PFD_BRG2"), null, this.bearing2Status.bind(this)),
                new PMFD_SoftKeyElement("返回", this.switchToMenu.bind(this, this.attitude_rootMenu))
            ];
            this.otherPfdMenu.elements = [
                new PMFD_SoftKeyElement(""),
                new PMFD_SoftKeyElement(""),
                new PMFD_SoftKeyElement(""),
                new PMFD_SoftKeyElement(""),
                new PMFD_SoftKeyElement(""),
                
                new PMFD_SoftKeyElement("风姿", this.switchToMenu.bind(this, this.windMenu)),
                new PMFD_SoftKeyElement("AOA", this.gps.computeEvent.bind(this.gps, "SoftKey_PFD_AoAMode"), null, this.aoaStatus.bind(this)),
                new PMFD_SoftKeyElement("更新率", this.setRefreshRate.bind(this), null, this.getRefreshRate.bind(this)),
                new PMFD_SoftKeyElement("COM1 121.5", null, this.constElement.bind(this, false)),
                new PMFD_SoftKeyElement("返回", this.switchToMenu.bind(this, this.pfdMenu))
            ];
                this.windMenu.elements = [
                    new PMFD_SoftKeyElement(""),
                    new PMFD_SoftKeyElement(""),
                    new PMFD_SoftKeyElement(""),
                    new PMFD_SoftKeyElement(""),
                    new PMFD_SoftKeyElement(""),
                    
                    new PMFD_SoftKeyElement("关闭", this.gps.computeEvent.bind(this.gps, "SoftKeys_Wind_Off"), this.windModeCompare.bind(this, "0")),
                    new PMFD_SoftKeyElement("选项1", this.gps.computeEvent.bind(this.gps, "SoftKeys_Wind_O1"), this.windModeCompare.bind(this, "1")),
                    new PMFD_SoftKeyElement("选项2", this.gps.computeEvent.bind(this.gps, "SoftKeys_Wind_O2"), this.windModeCompare.bind(this, "2")),
                    new PMFD_SoftKeyElement("选项3", this.gps.computeEvent.bind(this.gps, "SoftKeys_Wind_O3"), this.windModeCompare.bind(this, "3")),
                    new PMFD_SoftKeyElement("返回", this.switchToMenu.bind(this, this.otherPfdMenu))
                ];
        }
        this.map_rootMenu.elements = [
            new PMFD_SoftKeyElement("道路", this.showRoads.bind(this), null, this.showRoadsStatus.bind(this)),
            new PMFD_SoftKeyElement("地形", this.showBing.bind(this), null, this.showBingStatus.bind(this)),
            new PMFD_SoftKeyElement("空中交通", this.toggleTraffic.bind(this), null, this.showTrafficStatus.bind(this)),
            new PMFD_SoftKeyElement(""),
            new PMFD_SoftKeyElement(""),
			
            new PMFD_SoftKeyElement("地图<br/>放大", this.gps.computeEvent.bind(this.gps, "RANGE_DEC")),
            new PMFD_SoftKeyElement("地图<br/>缩小", this.gps.computeEvent.bind(this.gps, "RANGE_INC")),
            new PMFD_SoftKeyElement(""),
            new PMFD_SoftKeyElement(""),
            new PMFD_SoftKeyElement("页面", this.switchToMenu.bind(this, this.pageMenu))
        ];
		switch(this.menuIndex) {
            case "1":
				this.rootMenu = this.attitude_rootMenu;
                break;
            case "2":
				this.rootMenu = this.map_rootMenu;
                break;
		}
        this.pageMenu.elements = [
            new PMFD_SoftKeyElement(""),
            new PMFD_SoftKeyElement(""),
            new PMFD_SoftKeyElement(""),
            new PMFD_SoftKeyElement(""),
            new PMFD_SoftKeyElement(""),
			
            new PMFD_SoftKeyElement("姿态", this.newPage.bind(this, 1)),
            new PMFD_SoftKeyElement("地图", this.newPage.bind(this, 2)),
            new PMFD_SoftKeyElement(""),
            new PMFD_SoftKeyElement(""),
            new PMFD_SoftKeyElement("返回", this.backToRootMenu.bind(this))
        ];
        this.softKeys = this.rootMenu;
        this.topKeys.style.visibility = "hidden";
    }
    reset() {
        if (this.annunciations)
            this.annunciations.reset();
    }
	backToRootMenu(){
		/*
        let key = "menuIndex_" + this.index;
		let menuIndex = EBDDataIO.get(key);
		switch (menuIndex) {
            case "1":
				this.rootMenu = this.attitude_rootMenu;
                break;
            case "2":
				this.rootMenu = this.map_rootMenuu;
                break;
		}
        */
		this.softKeys = this.rootMenu;
	}
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        let smfd1Page = SimVar.GetSimVarValue("L:SMFD_1_Page", "number");
        if(smfd1Page == 1)
            this.smfd1hasMapControl = true;
        else
            this.smfd1hasMapControl = false;

        if(this.menuIndex == "2"){
            if(this.smfd1hasMapControl){
                // Stop and remove ebd-map-instrument class
                if(!this.mapRemoved){
                    this.topMapInstrument = null;
                    this.horizElem.removeChild(this.topMapHtmlElem);
                    //this.windData = null;
                    this.element = null;

                    this.alertHtmlElem.style.display = "flex";
                    this.mapRemoved = true;
                }
            }
            else {
                if(!this.topMapInstrument){
                    this.alertHtmlElem.style.display = "none";
                    this.loadMapPage();
                    this.mapRemoved = false;
                }
            }
        }
    }
    newPage(_page) {
		/*let key = "menuIndex_" + this.index;
		let success = EBDDataIO.set(key, _page.toString());
		if(success == null){
			console.log("Unable to write data: " + _page.toString() + " To: " + "menuIndex" + this.index);
		} else {
			console.log("Wrote Data");
		}*/
        this.menuIndex = _page.toString();
        switch (_page) {
            case 1: // Switch to Attitude Page
                this.instrumElem.style.display = "block";
                this.attitudeElem.style.display = "block";
                this.topKeys.style.visibility = "hidden";

                // Stop and remove ebd-map-instrument class
                if(!this.mapRemoved){
                    this.topMapInstrument = null;
                    this.horizElem.removeChild(this.topMapHtmlElem);
                    //this.windData = null;
                    this.element = null;
                } else {
                    this.alertHtmlElem.style.display = "none";
                }

                this.horizMapInstrument = new PMFD_MapElement();

                this.horizMapHtmlElem = document.createElement("ebd-map-instrument");
                this.horizMapHtmlElem.setAttribute("id", "SyntheticVision");
                this.horizMapHtmlElem.setAttribute("bing-id", "PFD_SyntheticVision");
                this.horizMapHtmlElem.setAttribute("bing-mode", "horizon");
                this.horizMapHtmlElem.setAttribute("show-overlay", "false");
                this.horizMapHtmlElem.setAttribute("config-path", "/Pages/VCockpit/Instruments/NavSystems/AS3000/PFD/");
                this.horizElem.appendChild(this.horizMapHtmlElem);
                
                this.element = new NavSystemElementGroup([
                    this.attitude,
                    this.pfd_airspeed,
                    new PMFD_Altimeter(),
                    this.annunciations,
                    this.compass,
                    new PFD_NavStatus(),
                    new PMFD_BottomInfos(),
                    new PMFD_ActiveCom(),
                    new PMFD_ActiveNav(),
                    new PMFD_NavStatus(),
                    this.aoaIndicator,
                    this.horizMapInstrument,
                    new PMFD_AutopilotDisplay(),
                    new PFD_Minimums(),
                    new PFD_RadarAltitude(),
                    new PFD_MarkerBeacon()
                ]);
                this.hsi = this.gps.getChildById("Compass");
                //this.wind = this.gps.getChildById("WindData");
                //this.mapInstrument.setGPS(this.gps);

                // Enable Engine Page and Disable Fuel Page
                //this.gps.computeEvent("DISABLE_FUEL_PAGE");
                //this.gps.computeEvent("ENABLE_ENGINE_PAGE");
				this.rootMenu = this.attitude_rootMenu;
                break;
            case 2: // Switch to Map Page
                this.instrumElem.style.display = "none";
                this.attitudeElem.style.display = "none";
                this.topKeys.style.visibility = "visible";
                
                if(this.topMapInstrument) // Map already diaplayed
                    break;
                console.log("Loading Map");

                this.horizMapInstrument = null;
                this.horizElem.removeChild(this.horizMapHtmlElem);
                // Add and start ebd-map-instrument class
                this.element = null;
                if(this.smfd1hasMapControl){
                    this.topMapInstrument = null;
                    this.alertHtmlElem.style.display = "flex";
                    this.mapRemoved = true;
                }
                else {
                    this.loadMapPage();
                    this.mapRemoved = false;
                }
                // Disable other pages
                //this.gps.computeEvent("DISABLE_FUEL_PAGE");
                //this.gps.computeEvent("DISABLE_ENGINE_PAGE");
				this.rootMenu = this.map_rootMenu;
                break;
        }
		this.softKeys = this.rootMenu;
    }
    loadMapPage(){

        this.topMapHtmlElem = document.createElement("ebd-map-instrument");
        this.topMapHtmlElem.setAttribute("id", "BigMap");
        this.topMapHtmlElem.setAttribute("bing-id", "MFD");
        this.topMapHtmlElem.setAttribute("bing-mode", "plane");
        this.topMapHtmlElem.setAttribute("config-path", "/Pages/VCockpit/Instruments/NavSystems/MFD/SMFD/");
        this.topMapHtmlElem.setAttribute("hide-flightplan-if-bushtrip", "true");
        this.horizElem.appendChild(this.topMapHtmlElem);

        this.topMapInstrument = new PMFD_BigMapElement();
        this.element = new NavSystemElementGroup([
            this.topMapInstrument,
            //this.windData
        ]);
    }
    switchToMenu(_menu) {
        this.softKeys = _menu;
    }
    constElement(_elem) {
        return _elem;
    }
    bearing1Status() {
        if (this.hsi && this.hsi.getAttribute("show_bearing1") == "true") {
            return this.hsi.getAttribute("bearing1_source");
        }
        else {
            return lbl_off;
        }
    }
    bearing2Status() {
        if (this.hsi && this.hsi.getAttribute("show_bearing2") == "true") {
            return this.hsi.getAttribute("bearing2_source");
        }
        else {
            return lbl_off;
        }
    }
    navStatus() {
        return this.hsi.getAttribute("nav_source");
    }
    windModeCompare(_comparison) {
        let windMode = SimVar.GetSimVarValue("L:Glasscockpit_Wind_Mode", "number");
        return windMode.toString() == _comparison;
    }
    aoaStatus() {
        switch (this.aoaIndicator.AoaMode) {
            case 0:
                return lbl_off;
            case 1:
                return lbl_on;
            case 2:
                return lbl_auto;
        }
    }
    hudFdStatus(){
        var fdisOn = SimVar.GetSimVarValue("L:XMLVAR_EBD_HUD_FD", "boolean");
        if(fdisOn)
            return lbl_on;
        return lbl_off;
    }
    toggleHudFD(){
        var fdisOn = SimVar.GetSimVarValue("L:XMLVAR_EBD_HUD_FD", "boolean");
        SimVar.SetSimVarValue("L:XMLVAR_EBD_HUD_FD", "boolean", !fdisOn);
    }
    getRefreshRate(){
        var qualityInt = parseInt(SimVar.GetSimVarValue("L:XMLVAR_EBD_PMFD_QUALITY", "number"));
        var qualityString;
        switch (qualityInt) {
            case 5:
                qualityString = lbl_ultra;
                break;
            case 4:
                qualityString = lbl_high;
                break;
            case 3:
                qualityString = lbl_medium;
                break;
            case 2:
                qualityString = lbl_low;
                break;
            case 1:
                qualityString = lbl_hidden;
                break;
            case 0:
                qualityString = lbl_disabled;
                break;
        }
        return qualityString;
    }
    setRefreshRate(){
        var qualityInt = parseInt(SimVar.GetSimVarValue("L:XMLVAR_EBD_PMFD_QUALITY", "number")) + 1;
        qualityInt == 6 ? qualityInt = 2 : qualityInt = qualityInt;
        SimVar.SetSimVarValue("L:XMLVAR_EBD_PMFD_QUALITY", "number", qualityInt);
    }
	showRoads(){
		this.topMapInstrument.toggleRoads();
	}
	showRoadsStatus(){
		if(this.topMapInstrument && this.topMapInstrument.showRoads){
			return lbl_on;
		}
		else {
			return lbl_off;
		}
	}
	showBing(){
		this.topMapInstrument.toggleBing();
	}
	showBingStatus(){
		if(this.topMapInstrument && this.topMapInstrument.showBing){
			return lbl_on;
		}
		else {
			return lbl_off;
		}
	}
	showTrafficStatus(){
		if(this.topMapInstrument && this.topMapInstrument.showTraffic)
			return lbl_on;
		else
			return lbl_off;
	}
	toggleTraffic(){
		this.topMapInstrument.toggleTraffic();
	}
}
class PMFD_MainElement extends NavSystemElement {
    init(root) {
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
    }
    onExit() {
    }
    onEvent(_event) {
    }
}

class PMFD_AutopilotDisplay extends PFD_AutopilotDisplay {
    init(root) {
        this.AP_LateralActive = this.gps.getChildById("AP_LateralActive");
        this.AP_LateralArmed = this.gps.getChildById("AP_LateralArmed");
        this.AP_Status = this.gps.getChildById("AP_Status");
        this.AP_YDStatus = this.gps.getChildById("AP_YDStatus");
        this.AP_FDIndicatorArrow = this.gps.getChildById("AP_FDIndicatorArrow");
        this.AP_VerticalActive = this.gps.getChildById("AP_VerticalActive");
        this.AP_ModeReference = this.gps.getChildById("AP_ModeReference");
        this.AP_Armed = this.gps.getChildById("AP_Armed");
        this.AP_ArmedReference = this.gps.getChildById("AP_ArmedReference");
        if (this.gps.instrumentXmlConfig) {
            let altimeterIndexElems = this.gps.instrumentXmlConfig.getElementsByTagName("AltimeterIndex");
            if (altimeterIndexElems.length > 0) {
                this.altimeterIndex = parseInt(altimeterIndexElems[0].textContent) + 1;
            }
        }
    }
}
class PMFD_Compass extends PFD_Compass {
    onEvent(_event) {
        super.onEvent(_event);
    }
}
class PMFD_BottomInfos extends NavSystemElement {
    init(root) {
        this.tas = this.gps.getChildById("TAS_Value");
        this.oat = this.gps.getChildById("OAT_Value");
        this.gs = this.gps.getChildById("GS_Value");
        this.isa = this.gps.getChildById("ISA_Value");
        this.timer = this.gps.getChildById("TMR_Value");
        this.utcTime = this.gps.getChildById("UTC_Value");
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        //Avionics.Utils.diffAndSet(this.tas, fastToFixed(Simplane.getMachSpeed(), 2));
        this.tas.textContent = fastToFixed(Simplane.getMachSpeed(), 2);
        //Avionics.Utils.diffAndSet(this.oat, fastToFixed(SimVar.GetSimVarValue("AMBIENT TEMPERATURE", "celsius"), 0) + "°C");
        this.oat.textContent = fastToFixed(SimVar.GetSimVarValue("AMBIENT TEMPERATURE", "celsius"), 0) + "°C";
        //diffAndSetText(this.oat, fastToFixed(SimVar.GetSimVarValue("AMBIENT TEMPERATURE", "celsius"), 0) + "°C");
        //Avionics.Utils.diffAndSet(this.gs, fastToFixed(SimVar.GetSimVarValue("GPS GROUND SPEED", "knots"), 0) + "KT");
        this.gs.textContent = fastToFixed(SimVar.GetSimVarValue("GPS GROUND SPEED", "knots"), 0) + "KT";
        //Avionics.Utils.diffAndSet(this.isa, fastToFixed(SimVar.GetSimVarValue("STANDARD ATM TEMPERATURE", "celsius"), 0) + "°C");
        this.isa.textContent = fastToFixed(SimVar.GetSimVarValue("STANDARD ATM TEMPERATURE", "celsius"), 0) + "°C";
        //Avionics.Utils.diffAndSet(this.utcTime, Utils.SecondsToDisplayTime(SimVar.GetGlobalVarValue("ZULU TIME", "seconds"), true, true, false));
        this.utcTime.textContent = Utils.SecondsToDisplayTime(SimVar.GetGlobalVarValue("ZULU TIME", "seconds"), true, true, false);
        //Avionics.Utils.diffAndSet(this.timer, Utils.SecondsToDisplayTime(SimVar.GetSimVarValue("L:AS3000_" + this.gps.urlConfig.index + "_Timer_Value", "number") / 1000, true, true, false));
        this.timer.textContent = Utils.SecondsToDisplayTime(SimVar.GetSimVarValue("L:AS3000_" + this.gps.urlConfig.index + "_Timer_Value", "number") / 1000, true, true, false);
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
class PMFD_ActiveCom extends NavSystemElement {
    init(root) {
        this.activeCom = this.gps.getChildById("ActiveCom");
        this.activeComFreq = this.gps.getChildById("ActiveComFreq");
        this.activeComName = this.gps.getChildById("ActiveComName");
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        //Avionics.Utils.diffAndSet(this.activeComFreq, this.gps.frequencyFormat(SimVar.GetSimVarValue("COM ACTIVE FREQUENCY:1", "MHz"), SimVar.GetSimVarValue("COM SPACING MODE:1", "Enum") == 0 ? 2 : 3));
        this.activeComFreq.innerHTML = this.gps.frequencyFormat(SimVar.GetSimVarValue("COM ACTIVE FREQUENCY:1", "MHz"), SimVar.GetSimVarValue("COM SPACING MODE:1", "Enum") == 0 ? 2 : 3);
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
class PMFD_ActiveNav extends NavSystemElement {
    init(root) {
        this.NavInfos = this.gps.getChildById("NavFreqInfos");
        this.ActiveNav = this.gps.getChildById("ActiveNav");
        this.ActiveNavFreq = this.gps.getChildById("ActiveNavFreq");
        this.ActiveNavName = this.gps.getChildById("ActiveNavName");
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        if (!SimVar.GetSimVarValue("GPS DRIVES NAV1", "Boolean")) {
           // Avionics.Utils.diffAndSetAttribute(this.NavInfos, "state", "Visible");
            this.NavInfos.setAttribute("state", "Visible");
            let index = SimVar.GetSimVarValue("AUTOPILOT NAV SELECTED", "number");
            //Avionics.Utils.diffAndSet(this.ActiveNav, "NAV" + index);
            this.ActiveNav.textContent = "NAV" + index;
            //Avionics.Utils.diffAndSet(this.ActiveNavFreq, this.gps.frequencyFormat(SimVar.GetSimVarValue("NAV ACTIVE FREQUENCY:" + index, "MHz"), 2));
            this.ActiveNavFreq.textContent = this.gps.frequencyFormat(SimVar.GetSimVarValue("NAV ACTIVE FREQUENCY:" + index, "MHz"), 2);
            //Avionics.Utils.diffAndSet(this.ActiveNavName, SimVar.GetSimVarValue("NAV SIGNAL:" + index, "number") > 0 ? SimVar.GetSimVarValue("NAV IDENT:" + index, "string") : "");
            this.ActiveNavName.textContent = SimVar.GetSimVarValue("NAV SIGNAL:" + index, "number") > 0 ? SimVar.GetSimVarValue("NAV IDENT:" + index, "string") : "";
        }
        else {
            //Avionics.Utils.diffAndSetAttribute(this.NavInfos, "state", "Inactive");
            this.NavInfos.setAttribute("state", "Inactive");
        }
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
class PMFD_NavStatus extends PFD_NavStatus {
    init(root) {
        this.currentLegFrom = this.gps.getChildById("FromWP");
        this.currentLegSymbol = this.gps.getChildById("LegSymbol");
        this.currentLegTo = this.gps.getChildById("ToWP");
        this.currentLegDistance = this.gps.getChildById("DisValue");
        this.currentLegBearing = this.gps.getChildById("BrgValue");
    }
}
class PMFD_AngleOfAttackIndicator extends NavSystemElement {
    constructor() {
        super(...arguments);
        this.AoaMode = 1;
    }
    init(root) {
        this.AoaElement = this.gps.getChildById("AoA");
        SimVar.SetSimVarValue("L:Glasscockpit_AOA_Mode", "number", this.AoaMode);
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        this.AoaElement.setAttribute("aoa", Math.min(Math.max(Simplane.getAngleOfAttack(), 0), 16).toString());
    }
    onExit() {
    }
    onEvent(_event) {
        if (_event == "SoftKey_PFD_AoAMode") {
            this.AoaMode = ((this.AoaMode + 1) % 3);
        }
        switch (_event) {
            case "AOA_Off":
                this.AoaMode = 0;
                break;
            case "AOA_On":
                this.AoaMode = 1;
                break;
            case "AOA_Auto":
                this.AoaMode = 2;
                break;
        }
        if (this.AoaMode == 0) {
            this.AoaElement.style.display = "none";
        }
        else {
            this.AoaElement.style.display = "block";
        }
        SimVar.SetSimVarValue("L:Glasscockpit_AOA_Mode", "number", this.AoaMode);
    }
}
class PMFD_MapElement extends MapInstrumentElement {
    constructor() {
        super(...arguments);
        this.wasOverride = false;
        this.lastMapMode = 0;
        this.lastWeatherMapMode = 0;
		this.showRoads = false;
		this.showBing = true;
		this.showTraffic = false;
        this.refreshRate = 1;
        this.frameCount = 0;
    }
    canUpdate(){
        this.frameCount++;
        if (this.frameCount >= Number.MAX_SAFE_INTEGER)
            this.frameCount = 0;
        //console.log("Refresh Rate:" + this.refreshRate);
        //console.log("Framecount:" + this.frameCount);
        //var qualityInt = parseInt(SimVar.GetSimVarValue("L:XMLVAR_EBD_PMFD_QUALITY", "number"));
        var quality;
        switch (this.refreshRate) {
            case 5:
                quality = Quality.ultra;
                break;
            case 4:
                quality = Quality.high;
                break;
            case 3:
                quality = Quality.medium;
                break;
            case 2:
                quality = Quality.low;
                break;
            case 1:
                quality = Quality.hidden;
                break;
            case 0:
                quality = Quality.disabled;
                break;
        }
        //console.log("String: " + quality);
        if (quality == Quality.ultra) {
            return true;
        }
        else if (quality == Quality.high) {
            if ((this.frameCount % 2) != 0) {
                return false;
            }
        }
        else if (quality == Quality.medium) {
            if ((this.frameCount % 4) != 0) {
                return false;
            }
        }
        else if (quality == Quality.low) {
            if ((this.frameCount % 32) != 0) {
                return false;
            }
        }
        else if (quality == Quality.hidden) {
            if ((this.frameCount % 128) != 0) {
                return false;
            }
        }
        else if (quality == Quality.disabled) {
            return false;
        }
        return true;
    }
    onUpdate(_deltaTime) {
        //console.log("Test5");
        if(!this.canUpdate()){
            return;
        }
        //console.log("Update");
        super.onUpdate(_deltaTime);
        let isPositionOverride = SimVar.GetSimVarValue("L:AS3000_MFD_IsPositionOverride", "number") != 0;
        if (isPositionOverride) {
            if (!this.wasOverride) {
                this.instrument.setAttribute("bing-mode", "ifr");
                this.wasOverride = true;
            }
            this.instrument.setCenter(new LatLong(SimVar.GetSimVarValue("L:AS3000_MFD_OverrideLatitude", "number"), SimVar.GetSimVarValue("L:AS3000_MFD_OverrideLongitude", "number")));
        }
        else {
            if (this.wasOverride) {
                this.instrument.setCenteredOnPlane();
                this.wasOverride = false;
            }
        }
        let mapMode = SimVar.GetSimVarValue("L:AS3000_MFD_Current_Map", "number");
        let weatherMapMode = SimVar.GetSimVarValue("L:AS3000_MFD_Current_WeatherMap", "number");
        if (this.lastMapMode != mapMode || (mapMode == 2 && this.lastWeatherMapMode != weatherMapMode)) {
            switch (mapMode) {
                case 0:
                    this.setWeather(EWeatherRadar.OFF);
                    break;
                case 2:
                    switch (weatherMapMode) {
                        case 0:
                            this.setWeather(EWeatherRadar.TOPVIEW);
                            break;
                        case 1:
                            this.setWeather(EWeatherRadar.OFF);
                            this.setWeather(EWeatherRadar.HORIZONTAL);
                            break;
                        case 2:
                            this.setWeather(EWeatherRadar.OFF);
                            this.setWeather(EWeatherRadar.VERTICAL);
                            break;
                    }
                    break;
            }
            this.lastMapMode = mapMode;
            this.lastWeatherMapMode = weatherMapMode;
        }
    }
    init(root) {
		//super.init(root);
        this.instrument = root.querySelector("ebd-map-instrument");
        if (this.instrument) {
            TemplateElement.callNoBinding(this.instrument, () => {
                this.onTemplateLoaded();
            });
        }
    }
    onTemplateLoaded() {
		super.onTemplateLoaded();
        if (this.instrument) {
            if(this.instrument.roadNetwork){
			    this.instrument.roadNetwork.setVisible(this.showRoads);
            }
			if(this.showBing)
				this.instrument.bingMap.style.display = "block";
			else
				this.instrument.bingMap.style.display = "none";
			this.instrument.showTraffic = this.showTraffic;
            //this.instrument.quality = this.quality;
        }
    }
	toggleRoads(){
        if (this.instrument) {
			this.showRoads = !this.showRoads;
			this.instrument.roadNetwork.setVisible(this.showRoads);
        }
	}
	toggleBing(){
        if (this.instrument) {
			this.showBing = !this.showBing;
			if(this.showBing)
				this.instrument.bingMap.style.display = "block";
			else
				this.instrument.bingMap.style.display = "none";
        }
	}
	toggleTraffic(){
        if (this.instrument) {
			this.showTraffic = !this.showTraffic;
			this.instrument.showTraffic = this.showTraffic;
        }
	}
	trafficStatus(){
		return this.instrument.showTraffic;
	}
}
class PMFD_BigMapElement extends MapInstrumentElement {
    constructor() {
        super(...arguments);
        this.wasOverride = false;
        this.lastMapMode = 0;
        this.lastWeatherMapMode = 0;
		this.showRoads = false;
		this.showBing = true;
		this.showTraffic = true;
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        let isPositionOverride = SimVar.GetSimVarValue("L:AS3000_MFD_IsPositionOverride", "number") != 0;
        if (isPositionOverride) {
            if (!this.wasOverride) {
                this.instrument.setAttribute("bing-mode", "ifr");
                this.wasOverride = true;
            }
            this.instrument.setCenter(new LatLong(SimVar.GetSimVarValue("L:AS3000_MFD_OverrideLatitude", "number"), SimVar.GetSimVarValue("L:AS3000_MFD_OverrideLongitude", "number")));
        }
        else {
            if (this.wasOverride) {
                this.instrument.setCenteredOnPlane();
                this.wasOverride = false;
            }
        }
        let mapMode = SimVar.GetSimVarValue("L:AS3000_MFD_Current_Map", "number");
        let weatherMapMode = SimVar.GetSimVarValue("L:AS3000_MFD_Current_WeatherMap", "number");
        if (this.lastMapMode != mapMode || (mapMode == 2 && this.lastWeatherMapMode != weatherMapMode)) {
            switch (mapMode) {
                case 0:
                    this.setWeather(EWeatherRadar.OFF);
                    break;
                case 2:
                    switch (weatherMapMode) {
                        case 0:
                            this.setWeather(EWeatherRadar.TOPVIEW);
                            break;
                        case 1:
                            this.setWeather(EWeatherRadar.OFF);
                            this.setWeather(EWeatherRadar.HORIZONTAL);
                            break;
                        case 2:
                            this.setWeather(EWeatherRadar.OFF);
                            this.setWeather(EWeatherRadar.VERTICAL);
                            break;
                    }
                    break;
            }
            this.lastMapMode = mapMode;
            this.lastWeatherMapMode = weatherMapMode;
        }
    }
    /*setGPS(_gps) {
        super.setGPS(_gps);
        this.instrument = null;
        this.instrument = this.gps.querySelector("ebd-map-instrument");
        if (this.instrument) {
            TemplateElement.callNoBinding(this.instrument, () => {
                this.onTemplateLoaded();
            });
        }
    }*/
    restart(_gps){
		//super.init(root);
        this.instrument = _gps.getChildById("ebd-map-instrument");
        this.fuelRangeCircle = _gps.getChildById("glasscockpit-fuel-range-circle");
        //this.onTemplateLoaded();
        if (this.instrument) {
            TemplateElement.callNoBinding(this.instrument, () => {
                this.onTemplateLoaded();
            });
        }
    }
    init(root) {
		//super.init(root);
        this.instrument = root.querySelector("ebd-map-instrument");
        this.fuelRangeCircle = root.querySelector("glasscockpit-fuel-range-circle");
        //this.onTemplateLoaded();
        if (this.instrument) {
            TemplateElement.callNoBinding(this.instrument, () => {
                this.onTemplateLoaded();
            });
        }
    }
    onTemplateLoaded() {
		super.onTemplateLoaded();
        if (this.instrument) {
            if(this.instrument.roadNetwork){
			    this.instrument.roadNetwork.setVisible(this.showRoads);
            }
			if(this.showBing)
				this.instrument.bingMap.style.display = "block";
			else
				this.instrument.bingMap.style.display = "none";
			this.instrument.showTraffic = this.showTraffic;
        }
    }
	toggleRoads(){
        if (this.instrument) {
			this.showRoads = !this.showRoads;
			this.instrument.roadNetwork.setVisible(this.showRoads);
        }
	}
	toggleBing(){
        if (this.instrument) {
			this.showBing = !this.showBing;
			if(this.showBing)
				this.instrument.bingMap.style.display = "block";
			else
				this.instrument.bingMap.style.display = "none";
        }
	}
	toggleTraffic(){
        if (this.instrument) {
			this.showTraffic = !this.showTraffic;
			this.instrument.showTraffic = this.showTraffic;
        }
	}
	trafficStatus(){
		return this.instrument.showTraffic;
	}
}
class PMFD_Altimeter extends NavSystemElement {
    constructor() {
        super(...arguments);
        this.lastAltitude = -10000;
        this.lastPressure = -10000;
        this.lastSelectedAltitude = -10000;
        this.selectedAltWasCaptured = false;
        this.blinkTime = 0;
        this.alertState = 0;
        this.altimeterIndex = 0;
        this.readyToSet = false;
    }
    init(root) {
        this.altimeterElement = this.gps.getChildById("Altimeter");
        if (this.gps.instrumentXmlConfig) {
            let altimeterIndexElems = this.gps.instrumentXmlConfig.getElementsByTagName("AltimeterIndex");
            if (altimeterIndexElems.length > 0) {
                this.altimeterIndex = parseInt(altimeterIndexElems[0].textContent) + 1;
            }
        }
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        var altitude = SimVar.GetSimVarValue("INDICATED ALTITUDE:" + this.altimeterIndex, "feet");
        var selectedAltitude = SimVar.GetSimVarValue("AUTOPILOT ALTITUDE LOCK VAR", "feet");
        if (altitude != this.lastAltitude) {
            this.altimeterElement.setAttribute("Altitude", altitude.toFixed(1));
            this.lastAltitude = altitude;
        }
        this.altimeterElement.setAttribute("vspeed", fastToFixed(Simplane.getVerticalSpeed(), 1));
        if (SimVar.GetSimVarValue("AUTOPILOT VERTICAL HOLD", "bool") || SimVar.GetSimVarValue("AUTOPILOT ALTITUDE LOCK", "bool")) {
            this.altimeterElement.setAttribute("reference-vspeed", fastToFixed(SimVar.GetSimVarValue("AUTOPILOT VERTICAL HOLD VAR", "feet per minute"), 0));
        }
        else {
            this.altimeterElement.setAttribute("reference-vspeed", "----");
        }
        let altitudeRefActive = true;
        if (altitudeRefActive) {
            if (selectedAltitude != this.lastSelectedAltitude) {
                this.altimeterElement.setAttribute("reference-altitude", selectedAltitude.toFixed(0));
                this.lastSelectedAltitude = selectedAltitude;
                this.selectedAltWasCaptured = false;
            }
            if (!this.selectedAltWasCaptured) {
                if (Math.abs(altitude - selectedAltitude) <= 200) {
                    this.selectedAltWasCaptured = true;
                    if (this.alertState < 2) {
                        this.blinkTime = 5000;
                    }
                    if (this.blinkTime > 0) {
                        //Avionics.Utils.diffAndSetAttribute(this.altimeterElement, "selected-altitude-alert", Math.floor(this.blinkTime / 250) % 2 == 0 ? "BlueText" : "Empty");
                        this.altimeterElement.setAttribute("selected-altitude-alert", Math.floor(this.blinkTime / 250) % 2 == 0 ? "BlueText" : "Empty");
                        this.blinkTime -= _deltaTime;
                    }
                    else {
                        //Avionics.Utils.diffAndSetAttribute(this.altimeterElement, "selected-altitude-alert", "BlueText");
                        this.altimeterElement.setAttribute("selected-altitude-alert", "BlueText");
                    }
                }
                else if (Math.abs(altitude - selectedAltitude) <= 1000) {
                    if (this.alertState < 1) {
                        this.blinkTime = 5000;
                    }
                    if (this.blinkTime > 0) {
                        //Avionics.Utils.diffAndSetAttribute(this.altimeterElement, "selected-altitude-alert", Math.floor(this.blinkTime / 250) % 2 == 0 ? "BlueBackground" : "BlueText");
                        this.altimeterElement.setAttribute("selected-altitude-alert", Math.floor(this.blinkTime / 250) % 2 == 0 ? "BlueBackground" : "BlueText");
                        this.blinkTime -= _deltaTime;
                    }
                    else {
                        //Avionics.Utils.diffAndSetAttribute(this.altimeterElement, "selected-altitude-alert", "BlueBackground");
                        this.altimeterElement.setAttribute("selected-altitude-alert", "BlueBackground");
                    }
                }
                else {
                    this.alertState = 0;
                    //Avionics.Utils.diffAndSetAttribute(this.altimeterElement, "selected-altitude-alert", "BlueText");
                    this.altimeterElement.setAttribute("selected-altitude-alert", "BlueText");
                }
            }
            else {
                if (Math.abs(altitude - selectedAltitude) <= 200) {
                    if (this.alertState != 2) {
                        this.blinkTime = 5000;
                        this.alertState = 2;
                    }
                    if (this.blinkTime > 0) {
                        //Avionics.Utils.diffAndSetAttribute(this.altimeterElement, "selected-altitude-alert", Math.floor(this.blinkTime / 250) % 2 == 0 ? "BlueText" : "Empty");
                        this.altimeterElement.setAttribute("selected-altitude-alert", Math.floor(this.blinkTime / 250) % 2 == 0 ? "BlueText" : "Empty");
                        this.blinkTime -= _deltaTime;
                    }
                    else {
                        //Avionics.Utils.diffAndSetAttribute(this.altimeterElement, "selected-altitude-alert", "BlueText");
                        this.altimeterElement.setAttribute("selected-altitude-alert", "BlueText");
                    }
                }
                else {
                    if (this.alertState != 3) {
                        this.blinkTime = 5000;
                        this.gps.playInstrumentSound("tone_altitude_alert_default");
                        this.alertState = 3;
                    }
                    if (this.blinkTime > 0) {
                        //Avionics.Utils.diffAndSetAttribute(this.altimeterElement, "selected-altitude-alert", Math.floor(this.blinkTime / 250) % 2 == 0 ? "YellowText" : "Empty");
                        this.altimeterElement.setAttribute("selected-altitude-alert", Math.floor(this.blinkTime / 250) % 2 == 0 ? "YellowText" : "Empty");
                        this.blinkTime -= _deltaTime;
                    }
                    else {
                        //Avionics.Utils.diffAndSetAttribute(this.altimeterElement, "selected-altitude-alert", "YellowText");
                        this.altimeterElement.setAttribute("selected-altitude-alert", "YellowText");
                    }
                }
            }
        }
        else {
            //Avionics.Utils.diffAndSetAttribute(this.altimeterElement, "reference-altitude", "----");
            this.altimeterElement.setAttribute("reference-altitude", "----");
            //Avionics.Utils.diffAndSetAttribute(this.altimeterElement, "selected-altitude-alert", "BlueText");
            this.altimeterElement.setAttribute("selected-altitude-alert", "BlueText");
        }
        let cdiSource = SimVar.GetSimVarValue("GPS DRIVES NAV1", "Bool") ? 3 : Simplane.getAutoPilotSelectedNav();
        switch (cdiSource) {
            case 1:
                if (SimVar.GetSimVarValue("NAV HAS GLIDE SLOPE:1", "Bool")) {
                    this.altimeterElement.setAttribute("vertical-deviation-mode", "GS");
                    this.altimeterElement.setAttribute("vertical-deviation-value", (SimVar.GetSimVarValue("NAV GSI:1", "number") / 127.0).toString());
                }
                else {
                    this.altimeterElement.setAttribute("vertical-deviation-mode", "None");
                }
                break;
            case 2:
                if (SimVar.GetSimVarValue("NAV HAS GLIDE SLOPE:2", "Bool")) {
                    this.altimeterElement.setAttribute("vertical-deviation-mode", "GS");
                    this.altimeterElement.setAttribute("vertical-deviation-value", (SimVar.GetSimVarValue("NAV GSI:2", "number") / 127.0).toString());
                }
                else {
                    this.altimeterElement.setAttribute("vertical-deviation-mode", "None");
                }
                break;
            case 3:
                if (this.gps.currFlightPlanManager.isActiveApproach() && Simplane.getAutoPilotApproachType() == ApproachType.APPROACH_TYPE_RNAV) {
                    this.altimeterElement.setAttribute("vertical-deviation-mode", "GP");
                    this.altimeterElement.setAttribute("vertical-deviation-value", (SimVar.GetSimVarValue("GPS VERTICAL ERROR", "meters") / 150).toString());
                }
                else if (SimVar.GetSimVarValue("NAV HAS GLIDE SLOPE:1", "Bool")) {
                    this.altimeterElement.setAttribute("vertical-deviation-mode", "GSPreview");
                    this.altimeterElement.setAttribute("vertical-deviation-value", (SimVar.GetSimVarValue("NAV GSI:1", "number") / 127.0).toString());
                }
                else {
                    if (SimVar.GetSimVarValue("NAV HAS GLIDE SLOPE:2", "Bool")) {
                        this.altimeterElement.setAttribute("vertical-deviation-mode", "GSPreview");
                        this.altimeterElement.setAttribute("vertical-deviation-value", (SimVar.GetSimVarValue("NAV GSI:2", "number") / 127.0).toString());
                    }
                    else {
                        this.altimeterElement.setAttribute("vertical-deviation-mode", "None");
                    }
                }
                break;
        }
        var pressure = SimVar.GetSimVarValue("KOHLSMAN SETTING HG:" + this.altimeterIndex, "inches of mercury");
        pressure = pressure.toFixed(2);
        if (pressure != this.lastPressure) {
            this.altimeterElement.setAttribute("pressure", pressure);
            this.lastPressure = pressure;
        }
    }
    onExit() {
    }
    onEvent(_event) {
        switch (_event) {
            case "BARO_INC":
                SimVar.SetSimVarValue("K:KOHLSMAN_INC", "number", this.altimeterIndex);
                break;
            case "BARO_DEC":
                SimVar.SetSimVarValue("K:KOHLSMAN_DEC", "number", this.altimeterIndex);
                break;
        }
    }
}


registerInstrument("pmfd-element", PMFD);
//# sourceMappingURL=PMFD.js.map
