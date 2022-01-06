/*
 * Include Style Info in softkeys via
 * javascript and not css.
 * Should be easier that way.
 *
*/
const lbl_on = "开启";
const lbl_off = "关闭";
const lbl_open = "打开";
const lbl_shut = "关闭";
const lbl_auto = "自动";
const lbl_mach = "MACH";
const lbl_airspeed = "AIRSPD";
const lbl_ready = "已就绪";
const lbl_loading = "准备中";
const simvar_wpn_door_main = "Z:J20_WPN_DOOR_MAIN";
const simvar_wpn_door_l = "Z:J20_WPN_DOOR_L";
const simvar_wpn_door_r = "Z:J20_WPN_DOOR_R";
const simvar_wpn_l1 = "Z:J20_WPN_L1";
const simvar_wpn_l2 = "Z:J20_WPN_L2";
const simvar_wpn_m1 = "Z:J20_WPN_M1";
const simvar_wpn_m2 = "Z:J20_WPN_M2";
const simvar_wpn_m3 = "Z:J20_WPN_M3";
const simvar_wpn_m4 = "Z:J20_WPN_M4";
const simvar_wpn_r2 = "Z:J20_WPN_R2";
const simvar_wpn_r1 = "Z:J20_WPN_R1";
const simvar_wpn_jammer = "Z:J20_WPN_JAMMER";
const simvar_wpn_flare = "Z:J20_WPN_FLARE";

class SMFD extends NavSystem {
    constructor() {
        super();
        this.initDuration = 5500;
    }
    get IsGlassCockpit() { return true; }
    get templateID() {
		return "SMFD"; 
	}

    connectedCallback() {
        super.connectedCallback();
        this.maxUpdateBudget = 12;
		this.fuelElement = this.getChildById("FuelPage");
        this.EnginesElement = this.getChildById("EnginePage");
        this.mapElem = this.getChildById("Map");
        this.weaponsElement = this.getChildById("WeaponsPage");
		
		this.windHtmlElem = document.createElement("glasscockpit-wind-data");
		this.windHtmlElem.setAttribute("id", "WindData");
		this.mapElem.appendChild(this.windHtmlElem);
        
        this.engines = new SMFD_Engine("Engine", "EnginePage");
		this.fuel = new SMFD_Fuel("Fuel", "FuelPage");
        this.weapons = new SMFD_Weapons("Weapons","WeaponsPage");
		
		// Set up initial Pages
        this.parsedUrl = new URL(this.getAttribute("Url").toLowerCase());
        this.index = this.parsedUrl.searchParams.get("index");
		
		let key = "menuIndex_" + this.index;
		let menuIndex = EBDDataIO.get(key);
		if(!menuIndex)
			menuIndex = this.index;
		switch(menuIndex) {
            case "1":
                this.EnginesElement.style.display = "none";
                this.fuelElement.style.display = "none";
                this.mapElem.style.display = "block";
                this.weaponsElement.style.display = "none";
                this.mapElem = this.getChildById("Map");
                this.mapHtmlElem = document.createElement("ebd-map-instrument");
                //this.mapHtmlElem = document.createElement("map-instrument");
                this.mapHtmlElem.setAttribute("bing-id", "MFD");
                this.mapHtmlElem.setAttribute("config-path", "/Pages/VCockpit/Instruments/NavSystems/MFD/SMFD/");
                this.mapHtmlElem.setAttribute("hide-flightplan-if-bushtrip", "true");
                this.mapElem.appendChild(this.mapHtmlElem);
                //this.fuel.enabled = false;
                //this.engines.enabled = false;
                break;
            case "2":
                this.EnginesElement.style.display = "block";
                this.fuelElement.style.display = "none";
                this.mapElem.style.display = "none";
                this.weaponsElement.style.display = "none";
                //this.fuel.enabled = false;
                break;
            case "3":
                this.EnginesElement.style.display = "none";
                this.fuelElement.style.display = "block";
                this.mapElem.style.display = "none";
                this.weaponsElement.style.display = "none";
                //this.engines.enabled = false;
                break;
		}
		
		// Set FBW with saved state only on index 1 so it's done only once
        /*
        * Removed to prevent accidental disable.
		if(this.index == 1){
			let fbwState = EBDDataIO.get("fbw");
			console.log("FBW: " + fbwState);
			if(fbwState != null && fbwState == "true"){
				SimVar.SetSimVarValue("L:XMLVAR_EBD_FBW_ENABLE", "Bool", 1);
			}
		}
        */
				
        this.mainPage = new SMFD_MainPage();
        this.pageGroups = [
            new NavSystemPageGroup("Main", this, [
                this.mainPage
            ]),
        ];
		this.mainPage.index = this.index;
		this.mainPage.menuIndex = menuIndex;
        this.addIndependentElementContainer(new NavSystemElementContainer("SoftKeys", "SoftKeys", new TwentySoftKeys(SMFD_SoftKeyHtmlElement)));
        this.addIndependentElementContainer(this.engines);
        this.addIndependentElementContainer(this.fuel);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
    }
    CanUpdate() {
        super.CanUpdate();
        var quality = Quality.medium;
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
    onEvent(_event) {
        super.onEvent(_event);
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
    }
    reboot() {
        super.reboot();
        if (this.engines)
            this.engines.reset();
    }
}
class SMFD_MainPage extends NavSystemPage {
    constructor() {
        super("Main", "Mainframe", new SMFD_MainElement());
		this.page = "EnginePage";
        this.rootMenu = new SoftKeysMenu();
        this.engine_rootMenu = new SoftKeysMenu();
        this.engineMenu = new SoftKeysMenu();
        this.eng1Menu = new SoftKeysMenu();
        this.eng2Menu = new SoftKeysMenu();
        this.fuel_rootMenu = new SoftKeysMenu();
        this.map_rootMenu = new SoftKeysMenu();
        this.autopilotMenu = new SoftKeysMenu();
        this.pageMenu = new SoftKeysMenu();
        this.EnginesElement = document.getElementById("EnginePage");
        this.weaponsElement = document.getElementById("WeaponsPage");
		this.index = null;
		this.menuIndex = null;
        this.map = null;
        this.windData = null;
        this.element = null;
        this.leftMenuElem = null;
        this.rightMenuElem = null;
        this.airbrakeStatus = null;

        this.weaponsMenu = new SoftKeysMenu();
    }
    connectedCallback() {
		super.connectedCallback();
	}
    init() {
        super.init();

        // Disable pages that aren't displayed after init
		switch(this.menuIndex) {
            case "1":  // Map
                this.map = new SMFD_MapElement();
                this.windData = new MFD_WindData();
                this.element = new NavSystemElementGroup([
                    this.map,
                    this.windData
                ]);
                this.gps.computeEvent("DISABLE_FUEL_PAGE");
                this.gps.computeEvent("DISABLE_ENGINE_PAGE");
                break;
            case "2":  // Engines
                this.gps.computeEvent("DISABLE_FUEL_PAGE");
                this.gps.computeEvent("ENABLE_ENGINE_PAGE");
                break;
            case "3":  // Fuel
                this.gps.computeEvent("ENABLE_FUEL_PAGE");
                this.gps.computeEvent("DISABLE_ENGINE_PAGE");
                break;
            case "4":  // Weapons
                this.gps.computeEvent("DISABLE_ENGINE_PAGE");
                this.gps.computeEvent("DISABLE_ENGINE_PAGE");
                break;
		}
        if(this.index == "1"){
            SimVar.SetSimVarValue(
                "L:SMFD_1_Page",
                "number", 
                parseInt(this.menuIndex)
            );
        }
		
		this.mapElem = this.gps.getChildById("Map");
		this.fuelElement = this.gps.getChildById("FuelPage");
        this.leftMenuElem = this.gps.getChildById("Left");
        this.rightMenuElem = this.gps.getChildById("Right");
        this.leftMenuElem.style.display = "none";
        this.rightMenuElem.style.display = "none";
		
        this.engine_rootMenu.elements = [
            new SMFD_SoftKeyElement("发动机", this.switchToMenu.bind(this, this.engineMenu)),
            new SMFD_SoftKeyElement("自飞控", this.switchToMenu.bind(this, this.autopilotMenu)),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
			
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement("页面", this.switchToMenu.bind(this, this.pageMenu)),
			
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
			
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement("")
        ];
        {
            this.engineMenu.elements = [
                new SMFD_SoftKeyElement("发动机1<br>控制", this.switchToMenu.bind(this, this.eng1Menu)),
                new SMFD_SoftKeyElement("发动机2<br>控制", this.switchToMenu.bind(this, this.eng2Menu)),
                new SMFD_SoftKeyElement(""),
                new SMFD_SoftKeyElement(""),
                new SMFD_SoftKeyElement(""),
                
                new SMFD_SoftKeyElement(""),
                new SMFD_SoftKeyElement(""),
                new SMFD_SoftKeyElement(""),
                new SMFD_SoftKeyElement(""),
                new SMFD_SoftKeyElement("返回", this.backToRootMenu.bind(this))
            ];
            {
                this.eng1Menu.elements = [
                    new SMFD_SoftKeyElement("燃料阀", this.vlvSet.bind(this, "1"), null, this.vlvStatus.bind(this, "1")),
                    new SMFD_SoftKeyElement("点火", this.ignSet.bind(this, "1"), null, this.ignStatus.bind(this, "1")),
                    new SMFD_SoftKeyElement("启动", this.starterSet.bind(this, "1"), null, this.starterStatus.bind(this, "1")),
                    new SMFD_SoftKeyElement(""),
                    new SMFD_SoftKeyElement(""),
                    
                    new SMFD_SoftKeyElement(""),
                    new SMFD_SoftKeyElement(""),
                    new SMFD_SoftKeyElement(""),
                    new SMFD_SoftKeyElement(""),
                    new SMFD_SoftKeyElement("返回", this.switchToMenu.bind(this, this.engineMenu))
                ];
                this.eng2Menu.elements = [
                    new SMFD_SoftKeyElement("燃料阀", this.vlvSet.bind(this, "2"), null, this.vlvStatus.bind(this, "2")),
                    new SMFD_SoftKeyElement("点火", this.ignSet.bind(this, "2"), null, this.ignStatus.bind(this, "2")),
                    new SMFD_SoftKeyElement("启动", this.starterSet.bind(this, "2"), null, this.starterStatus.bind(this, "2")),
                    new SMFD_SoftKeyElement(""),
                    new SMFD_SoftKeyElement(""),
                    
                    new SMFD_SoftKeyElement(""),
                    new SMFD_SoftKeyElement(""),
                    new SMFD_SoftKeyElement(""),
                    new SMFD_SoftKeyElement(""),
                    new SMFD_SoftKeyElement("返回", this.switchToMenu.bind(this, this.engineMenu))
                ];
            }
        }
        this.fuel_rootMenu.elements = [
            new SMFD_SoftKeyElement("自飞控", this.switchToMenu.bind(this, this.autopilotMenu)),
            //new SMFD_SoftKeyElement("Fly By<br/>Wire", this.fbwSet.bind(this), null, this.fbwStatus.bind(this)),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement("空气刹", this.setAirbrakes.bind(this), null, this.getAirbrakeStatus.bind(this)),
            new SMFD_SoftKeyElement("伸展襟翼", this.extFlaps.bind(this)),
            new SMFD_SoftKeyElement("收回襟翼", this.retFlaps.bind(this)),
			
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement("页面", this.switchToMenu.bind(this, this.pageMenu)),
			
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
			
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement("")
        ];
        this.map_rootMenu.elements = [
            new SMFD_SoftKeyElement("道路", this.showRoads.bind(this), null, this.showRoadsStatus.bind(this)),
            new SMFD_SoftKeyElement("地形", this.showBing.bind(this), null, this.showBingStatus.bind(this)),
            new SMFD_SoftKeyElement("空中交通", this.toggleTraffic.bind(this), null, this.showTrafficStatus.bind(this)),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
			
            new SMFD_SoftKeyElement("地图<br/>放大", this.gps.computeEvent.bind(this.gps, "RANGE_DEC")),
            new SMFD_SoftKeyElement("地图<br/>缩小", this.gps.computeEvent.bind(this.gps, "RANGE_INC")),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement("页面", this.switchToMenu.bind(this, this.pageMenu))
        ];
        this.weaponsMenu.elements = [
            new SMFD_SoftKeyElement("主发射"),
            new SMFD_SoftKeyElement("左发射"),
            new SMFD_SoftKeyElement("右发射"),
            new SMFD_SoftKeyElement("电子干扰"),
            new SMFD_SoftKeyElement("干扰弹"),
			
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement("页面", this.switchToMenu.bind(this, this.pageMenu)),
			
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
			
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement("")
        ];
		switch(this.menuIndex) {
            case "1":
				this.rootMenu = this.map_rootMenu;
                break;
            case "2":
				this.rootMenu = this.engine_rootMenu;
                break;
            case "3":
				this.rootMenu = this.fuel_rootMenu;
                break;
            case "4":
                this.rootMenu = this.weaponsMenu;
                break;
		}
        this.autopilotMenu.elements = [
            new SMFD_SoftKeyElement("MASTER", this.toggleAPMaster.bind(this), null, this.apMasterStatus.bind(this)),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement("NAV", this.toggleAPNav.bind(this), null, this.apNavStatus.bind(this)),
            new SMFD_SoftKeyElement("APPROACH", this.toggleAPApr.bind(this), null, this.apAprStatus.bind(this)),
            new SMFD_SoftKeyElement("自动油门", this.toggleAutoThrottle.bind(this), null, this.autoThrottleStatus.bind(this)),
			
            new SMFD_SoftKeyElement("方位", this.toggleAPHdg.bind(this), null, this.apHdgStatus.bind(this)),
            new SMFD_SoftKeyElement("高度", this.toggleAPAlt.bind(this), null, this.apAltStatus.bind(this)),
            new SMFD_SoftKeyElement("VS", this.toggleAPVS.bind(this), null, this.apVSStatus.bind(this)),
            new SMFD_SoftKeyElement("速控<br>模式", this.toggleAPSpd.bind(this), null, this.apSpdStatus.bind(this)),
            new SMFD_SoftKeyElement("返回", this.backToRootMenu.bind(this)),
			
            new SMFD_SoftKeyElement("<br><br>速度 +", this.speedDecInc.bind(this, 1)),
            new SMFD_SoftKeyElement("<br><br>速度 -", this.speedDecInc.bind(this, -1)),
            new SMFD_SoftKeyElement("<br><br>方位 +", this.hdgDecInc.bind(this, 1)),
            new SMFD_SoftKeyElement("<br><br>方位 -", this.hdgDecInc.bind(this, -1)),
            new SMFD_SoftKeyElement(""),
			
            new SMFD_SoftKeyElement("<br><br>高度 +", this.altDecInc.bind(this, 1)),
            new SMFD_SoftKeyElement("<br><br>高度 -", this.altDecInc.bind(this, -1)),
            new SMFD_SoftKeyElement("<br><br>VS +", this.vsDecInc.bind(this, 1)),
            new SMFD_SoftKeyElement("<br><br>VS -", this.vsDecInc.bind(this, -1)),
            new SMFD_SoftKeyElement("")
        ];
        this.pageMenu.elements = [
            new SMFD_SoftKeyElement("地图", this.newPage.bind(this, 1)),
            new SMFD_SoftKeyElement("发动机", this.newPage.bind(this, 2)),
            new SMFD_SoftKeyElement("燃料", this.newPage.bind(this, 3)),
            new SMFD_SoftKeyElement("武器<br/>防御",this.newPage.bind(this, 4)),
            new SMFD_SoftKeyElement(""),
			
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement(""),
            new SMFD_SoftKeyElement("返回", this.backToRootMenu.bind(this))
        ];
        this.softKeys = this.rootMenu;
    }
    reset() {
    }
    switchToMenu(_menu) {
        this.softKeys = _menu;
        if(_menu == this.autopilotMenu){
            this.leftMenuElem.style.display = "flex";
            this.rightMenuElem.style.display = "flex";
        }
    }
	backToRootMenu(){ 
        if(this.softKeys == this.autopilotMenu) {
            this.leftMenuElem.style.display = "none";
            this.rightMenuElem.style.display = "none";
        }
		let key = "menuIndex_" + this.index;
		let menuIndex = EBDDataIO.get(key);
		switch (menuIndex) {
            case "1":
				this.rootMenu = this.map_rootMenu;
                break;
            case "2":
				this.rootMenu = this.engine_rootMenu;
                break;
            case "3":
				this.rootMenu = this.fuel_rootMenu;
                break;
            case "4":
                this.rootMenu = this.weaponsMenu;
                break;
		}
		this.softKeys = this.rootMenu;
	}
    extFlaps(){
        SimVar.SetSimVarValue(
            "K:FLAPS_INCR",
            "boolean", 
            1
        );
    }
    retFlaps(){
        SimVar.SetSimVarValue(
            "K:FLAPS_DECR",
            "boolean", 
            1
        );
    }
	fbwStatus(){
		var fbwBool = SimVar.GetSimVarValue("L:XMLVAR_EBD_FBW_ENABLE", "Boolean");
		if(fbwBool){
			return lbl_on;
		}
		else {
			return lbl_off;
		}
	}
	fbwSet(){
		let newFbwValue = !SimVar.GetSimVarValue("L:XMLVAR_EBD_FBW_ENABLE", "Boolean");
		let success = EBDDataIO.set("fbw", newFbwValue.toString());
		if(success == null){
			console.log("Unable to write data: " + newFbwValue.toString() + " To: " + "fbw");
		} else {
			console.log("Wrote Data: " + newFbwValue.toString() + " To: " + "fbw");
		}
        SimVar.SetSimVarValue(
			"L:XMLVAR_EBD_FBW_ENABLE", 
			"Boolean", 
			newFbwValue
		);
	}
    newPage(_page) {
		let key = "menuIndex_" + this.index;
		let success = EBDDataIO.set(key, _page.toString());
		if(success == null){
			console.log("Unable to write data: " + _page.toString() + " To: " + "menuIndex" + this.index);
		} else {
			console.log("Wrote Data");
		}
		if(this.index == "1"){
            console.log("Test");
            SimVar.SetSimVarValue(
                "L:SMFD_1_Page",
                "number", 
                _page
            );
        }
        switch (_page) {
            case 1: // Switch to Map Page
                this.EnginesElement.style.display = "none";
                this.fuelElement.style.display = "none";
                this.mapElem.style.display = "block";
                this.weaponsElement.style.display = "none";

                // Add and start ebd-map-instrument class
                //if(document.getElementsByTagName("map-instrument").length == 0){
                if(document.getElementsByTagName("ebd-map-instrument").length == 0){
                    console.log("Loading Map");
                    let mapHtmlElem = document.createElement("ebd-map-instrument");
                    //let mapHtmlElem = document.createElement("map-instrument");
                    mapHtmlElem.setAttribute("bing-id", "MFD");
                    mapHtmlElem.setAttribute("config-path", "/Pages/VCockpit/Instruments/NavSystems/MFD/SMFD/");
                    mapHtmlElem.setAttribute("hide-flightplan-if-bushtrip", "true");
                    this.mapElem.appendChild(mapHtmlElem);
                    this.map = new SMFD_MapElement();
                    this.windData = new MFD_WindData();
                    this.element = new NavSystemElementGroup([
                        this.map,
                        this.windData
                    ]);

                    // Disable other pages
                    this.gps.computeEvent("DISABLE_FUEL_PAGE");
                    this.gps.computeEvent("DISABLE_ENGINE_PAGE");
                }

                // Update Menu
				this.rootMenu = this.map_rootMenu;
                break;
            case 2: // Switch to Engines Page
                this.EnginesElement.style.display = "block";
                this.fuelElement.style.display = "none";
                this.mapElem.style.display = "none";
                this.weaponsElement.style.display = "none";

                // Stop and remove ebd-map-instrument class
                this.mapHtmlElems = document.getElementsByTagName("ebd-map-instrument");
                //this.mapHtmlElems = document.getElementsByTagName("map-instrument");
                for(let i = 0; i < this.mapHtmlElems.length; i++){
                    this.mapHtmlElems[i].parentNode.removeChild(this.mapHtmlElems[i]);
                    this.map = null;
                    this.windData = null;
                    this.element = null;
                }

                // Enable Engine Page and Disable Fuel Page
                this.gps.computeEvent("DISABLE_FUEL_PAGE");
                this.gps.computeEvent("ENABLE_ENGINE_PAGE");

                // Update Menu
				this.rootMenu = this.engine_rootMenu;
                break;
            case 3: // Switch to Fuel Page
                this.EnginesElement.style.display = "none";
                this.fuelElement.style.display = "block";
                this.mapElem.style.display = "none";
                this.weaponsElement.style.display = "none";

                // Stop and remove ebd-map-instrument class
                this.mapHtmlElems = document.getElementsByTagName("ebd-map-instrument");
                //this.mapHtmlElems = document.getElementsByTagName("map-instrument");
                for(let i = 0; i < this.mapHtmlElems.length; i++){
                    this.mapHtmlElems[i].parentNode.removeChild(this.mapHtmlElems[i]);
                    this.map = null;
                    this.windData = null;
                    this.element = null;
                }

                // Enable Fuel page and disable Engine Page
                this.gps.computeEvent("ENABLE_FUEL_PAGE");
                this.gps.computeEvent("DISABLE_ENGINE_PAGE");

                // Update Menu
				this.rootMenu = this.fuel_rootMenu;
                break;
            case 4: // Switch to weapons Page
                this.EnginesElement.style.display = "none";
                this.fuelElement.style.display = "none";
                this.mapElem.style.display = "none";
                this.weaponsElement.style.display = "block";

                // Stop and remove ebd-map-instrument class
                this.mapHtmlElems = document.getElementsByTagName("ebd-map-instrument");
                //this.mapHtmlElems = document.getElementsByTagName("map-instrument");
                for(let i = 0; i < this.mapHtmlElems.length; i++){
                    this.mapHtmlElems[i].parentNode.removeChild(this.mapHtmlElems[i]);
                    this.map = null;
                    this.windData = null;
                    this.element = null;
                }

                // Disable Fuel page and disable Engine Page
                this.gps.computeEvent("DISABLE_FUEL_PAGE");
                this.gps.computeEvent("DISABLE_ENGINE_PAGE");

                // Update Menu
				this.rootMenu = this.weaponsMenu;
                break;
        }
		this.softKeys = this.rootMenu;
    }
    vlvStatus(eng){
		var vlvBool = SimVar.GetSimVarValue("A:GENERAL ENG FUEL VALVE:" + eng, "Bool");
		if(vlvBool){
			return lbl_open;
		}
		else {
			return lbl_shut;
		}
    }
    vlvSet(eng){
		SimVar.SetSimVarValue(
			"K:TOGGLE_FUEL_VALVE_ENG" + eng,
			"Boolean", 
			1
		);
    }
    ignStatus(eng){
		var ignBool = SimVar.GetSimVarValue("A:TURB ENG IGNITION SWITCH:" + eng, "Boolean");
		if(ignBool){
			return lbl_auto;
		}
		else {
			return lbl_off;
		}
    }
    ignSet(eng){
        var ignBool = SimVar.GetSimVarValue("A:TURB ENG IGNITION SWITCH:" + eng, "Boolean");
		SimVar.SetSimVarValue(
			"A:TURB ENG IGNITION SWITCH EX1:" + eng,
			"Boolean", 
			!ignBool
		);
    }
    starterStatus(eng){
		var starterBool = SimVar.GetSimVarValue("A:GENERAL ENG STARTER:" + eng, "Boolean");
		if(starterBool){
			return lbl_on;
		}
		else {
			return lbl_off;
		}
    }
    starterSet(eng){
		SimVar.SetSimVarValue(
			"K:TOGGLE_STARTER" + eng,
			"Boolean", 
			1
		);
    }
	showRoads(){
		this.map.toggleRoads();
	}
	showRoadsStatus(){
		if(this.map.showRoads){
			return lbl_on;
		}
		else {
			return lbl_off;
		}
	}
	showBing(){
		this.map.toggleBing();
	}
	showBingStatus(){
		if(this.map.showBing){
			return lbl_on;
		}
		else {
			return lbl_off;
		}
	}
	showTrafficStatus(){
		if(this.map.showTraffic)
			return lbl_on;
		else
			return lbl_off;
	}
	toggleTraffic(){
		this.map.toggleTraffic();
	}
    toggleAPMaster(){
        SimVar.SetSimVarValue("K:AP_MASTER", "number", 0);
    }
	apMasterStatus(){
		var apMasBool = SimVar.GetSimVarValue("A:AUTOPILOT MASTER", "Boolean");
		if(apMasBool){
			return lbl_on;
		}
		else {
			return lbl_off;
		}
	}
    toggleAPNav(){
        SimVar.SetSimVarValue("K:AP_NAV1_HOLD", "number", 0);
    }
	apNavStatus(){
		var apNavBool = SimVar.GetSimVarValue("A:AUTOPILOT NAV1 LOCK", "Boolean");
		if(apNavBool){
			return lbl_on;
		}
		else {
			return lbl_off;
		}
	}
    toggleAutoThrottle(){
        SimVar.SetSimVarValue("K:AUTO_THROTTLE_ARM", "number", 0);
    }
	autoThrottleStatus(){
		var statusBool = SimVar.GetSimVarValue("A:AUTOPILOT THROTTLE ARM", "Boolean");
		if(statusBool){
			return lbl_on;
		}
		else {
			return lbl_off;
		}
	}
    toggleAPHdg(){
        SimVar.SetSimVarValue("K:AP_PANEL_HEADING_HOLD", "number", 0);
    }
	apHdgStatus(){
		var statusBool = SimVar.GetSimVarValue("A:AUTOPILOT HEADING LOCK", "Boolean");
		if(statusBool){
			return lbl_on;
		}
		else {
			return lbl_off;
		}
	}
    toggleAPAlt(){
        SimVar.SetSimVarValue("K:AP_PANEL_VS_HOLD", "number", 0);
    }
	apAltStatus(){
		var statusBool = SimVar.GetSimVarValue("A:AUTOPILOT VERTICAL HOLD", "Boolean");
		if(statusBool){
			return lbl_on;
		}
		else {
			return lbl_off;
		}
	}
    toggleAPSpd(){
        if((SimVar.GetSimVarValue("AUTOPILOT MACH HOLD", "Boolean") || SimVar.GetSimVarValue("AUTOPILOT MANAGED SPEED IN MACH", "Boolean"))){
            SimVar.SetSimVarValue("K:AP_PANEL_SPEED_HOLD", "number", 0);
        } else {
            SimVar.SetSimVarValue("K:AP_PANEL_MACH_HOLD", "number", 0);
        }
    }
	apSpdStatus(){
		var statusBool = SimVar.GetSimVarValue("A:AUTOPILOT AIRSPEED HOLD", "Boolean");
		if(SimVar.GetSimVarValue("AUTOPILOT MACH HOLD", "Boolean") || SimVar.GetSimVarValue("AUTOPILOT MANAGED SPEED IN MACH", "Boolean")){
			return lbl_mach;
		}
		else {
			return lbl_airspeed;
		}
	}
    toggleAPVS(){
        SimVar.SetSimVarValue("K:AP_PANEL_ALTITUDE_HOLD", "number", 0);
    }
	apVSStatus(){
		var statusBool = SimVar.GetSimVarValue("A:AUTOPILOT ALTITUDE LOCK", "Boolean");
		if(statusBool){
			return lbl_on;
		}
		else {
			return lbl_off;
		}
	}
    toggleAPApr(){
        SimVar.SetSimVarValue("K:AP_APR_HOLD", "number", 0);
    }
	apAprStatus(){
		var statusBool = SimVar.GetSimVarValue("A:AUTOPILOT APPROACH HOLD", "Boolean");
		if(statusBool){
			return lbl_on;
		}
		else {
			return lbl_off;
		}
	}

    speedDecInc(number){
        if((SimVar.GetSimVarValue("AUTOPILOT MACH HOLD", "Boolean") || SimVar.GetSimVarValue("AUTOPILOT MANAGED SPEED IN MACH", "Boolean"))){
            if(number > 0){
                //this.backToRootMenu();
                SimVar.SetSimVarValue("K:AP_MACH_VAR_INC", "number", 0);
            } else {
                SimVar.SetSimVarValue("K:AP_MACH_VAR_DEC", "number", 0);
            }
        } else {
            if(number > 0){
                //this.backToRootMenu();
                SimVar.SetSimVarValue("K:AP_SPD_VAR_INC", "number", 0);
            } else {
                SimVar.SetSimVarValue("K:AP_SPD_VAR_DEC", "number", 0);
            }
        }
    }
    altDecInc(number){
        if(number > 0){
            SimVar.SetSimVarValue("K:AP_ALT_VAR_INC", "number", 0);
        } else {
            SimVar.SetSimVarValue("K:AP_ALT_VAR_DEC", "number", 0);
        }
    }
    hdgDecInc(number){
        if(number > 0){
            SimVar.SetSimVarValue("K:HEADING_BUG_INC", "number", 0);
        } else {
            SimVar.SetSimVarValue("K:HEADING_BUG_DEC", "number", 0);
        }
    }
    vsDecInc(number){
        if(number > 0){
            SimVar.SetSimVarValue("K:AP_VS_VAR_INC", "number", 0);
        } else {
            SimVar.SetSimVarValue("K:AP_VS_VAR_DEC", "number", 0);
        }
    }
    getAirbrakeStatus(){
		this.airbrakeStatus = SimVar.GetSimVarValue("A:SPOILERS LEFT POSITION", "number");
        if(this.airbrakeStatus > 0){
            return lbl_on;
        } else {
            return lbl_off;
        }
    }
    setAirbrakes(){
        SimVar.SetSimVarValue("K:SPOILERS_TOGGLE", "number", 0);
        if(this.airbrakeStatus > 0){
        } else {

        }
    }
}
class SMFD_MainElement extends NavSystemElement {
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
class SMFD_SoftKeyHtmlElement extends SoftKeyHtmlElement {
    constructor(_elem) {
        super(_elem);
        this.Element = _elem.getElementsByClassName("Title")[0];
        this.ValueElement = _elem.getElementsByClassName("Value")[0];
        this.StatusBar = _elem.getElementsByClassName("Status")[0];
    }
    fillFromElement(_elem) {
        super.fillFromElement(_elem);
        if (_elem.statusBarCallback == null) {
            //Avionics.Utils.diffAndSetAttribute(this.StatusBar, "state", "None");
            this.StatusBar.setAttribute("state", "None");
        }
        else {
            if (_elem.statusBarCallback()) {
                //Avionics.Utils.diffAndSetAttribute(this.StatusBar, "state", "Active");
                this.StatusBar.setAttribute("state", "Active");
            }
            else {
                //Avionics.Utils.diffAndSetAttribute(this.StatusBar, "state", "Inactive");
                this.StatusBar.setAttribute("state", "Inactive");
            }
        }
        if (_elem.valueCallback == null) {
            //Avionics.Utils.diffAndSet(this.ValueElement, "");
            this.ValueElement.textContent = "";
        }
        else {
            //Avionics.Utils.diffAndSet(this.ValueElement, _elem.valueCallback());
            this.ValueElement.textContent = _elem.valueCallback();
        }
    }
}
class SMFD_MapElement extends MapInstrumentElement {
    constructor() {
        super(...arguments);
        this.wasOverride = false;
        this.lastMapMode = 0;
        this.lastWeatherMapMode = 0;
		this.showRoads = false;
		this.showBing = false;
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
    init(root) {
		super.init(root);
        this.instrument = root.querySelector("ebd-map-instrument");
        //this.instrument = root.querySelector("map-instrument");
        if (this.instrument) {
            TemplateElement.callNoBinding(this.instrument, () => {
                this.onTemplateLoaded();
            });
        }
    }
    onTemplateLoaded() {
		super.onTemplateLoaded();
        if (this.instrument) {
			if(this.showBing)
				this.instrument.bingMap.style.display = "block";
			else
				this.instrument.bingMap.style.display = "none";
			this.instrument.showTraffic = this.showTraffic;
			this.instrument.roadNetwork.setVisible(this.showRoads);
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
class SMFD_MainMap extends NavSystemPage {
    constructor() {
        super("NAVIGATION MAP", "Map", new NavSystemElementGroup([
            new SMFD_MapElement(),
            new MFD_WindData()
        ]));
    }
    init() {
    }
}
class SMFD_Engine extends NavSystemElementContainer {
    constructor(_name, _root) {
        super(_name, _root, null);
        this.nbEngineReady = 0;
        this.allElements = [];
        this.allEnginesReady = false;
        this.widthSet = false;
        this.xmlEngineDisplay = null;
        this.enabled = true;
    }
    init() {
        super.init();
        this.root = this.gps.getChildById(this.htmlElemId);
        if (!this.root) {
            console.error("Root component expected!");
            return;
        }
        let fromConfig = false;
        if (this.gps.xmlConfig) {
            let engineRoot = this.gps.xmlConfig.getElementsByTagName("EngineDisplay");
            if (engineRoot.length > 0) {
                fromConfig = true;
                this.root.setAttribute("state", "XML");
                this.xmlEngineDisplay = this.root.querySelector("glasscockpit-xmlenginedisplay");
                this.xmlEngineDisplay.setConfiguration(this.gps, engineRoot[0]);
            }
        }
        if (!fromConfig) {
            this.engineType = Simplane.getEngineType();
            this.engineCount = Simplane.getEngineCount();
            var ed = this.root.querySelector("as3000-engine-display");
            if (!ed) {
                console.error("Engine Display component expected!");
                return;
            }
            TemplateElement.call(ed, this.initEngines.bind(this));
        }
    }
    initEngines() {
        this.initSettings();
        switch (this.engineType) {
            case EngineType.ENGINE_TYPE_PISTON:
                {
                    this.root.setAttribute("state", "piston");
                    this.addGauge().Set(this.gps.getChildById("Piston_VacGauge"), this.settings.Vacuum, this.getVAC.bind(this), "VAC", "inHg");
                    this.addGauge().Set(this.gps.getChildById("Piston_FuelGaugeL"), this.settings.FuelQuantity, this.getFuelL.bind(this), "L FUEL QTY", "GAL");
                    this.addGauge().Set(this.gps.getChildById("Piston_FuelGaugeR"), this.settings.FuelQuantity, this.getFuelR.bind(this), "R FUEL QTY", "GAL");
                    this.addText().Set(this.gps.getChildById("Piston_EngineHours"), this.getEngineHours.bind(this));
                    this.addText().Set(this.gps.getChildById("Piston_Bus_M"), this.getVoltsBus.bind(this));
                    this.addText().Set(this.gps.getChildById("Piston_Bus_E"), this.getVoltsBattery.bind(this));
                    this.addText().Set(this.gps.getChildById("Piston_Batt_M"), this.getAmpsBattery.bind(this));
                    this.addText().Set(this.gps.getChildById("Piston_Batt_S"), this.getAmpsGenAlt.bind(this));
                    var engineRoot = this.root.querySelector("#PistonEnginesPanel");
                    if (engineRoot) {
                        for (var i = 0; i < this.engineCount; i++) {
                            let engine = new AS3000_PistonEngine();
                            TemplateElement.call(engine, this.onEngineReady.bind(this, engine, i));
                            engineRoot.appendChild(engine);
                        }
                    }
                    else {
                        console.error("Unable to find engine root");
                        return;
                    }
                    break;
                }
            case EngineType.ENGINE_TYPE_TURBOPROP:
            case EngineType.ENGINE_TYPE_JET:
                {
                    this.root.setAttribute("state", "turbo");
                    this.addGauge().Set(this.gps.getChildById("Turbo_AmpGauge1"), this.settings.BatteryBusAmps, this.getAmpsBattery.bind(this), "", "AMPS B");
                    this.addGauge().Set(this.gps.getChildById("Turbo_AmpGauge2"), this.settings.GenAltBusAmps, this.getAmpsGenAlt.bind(this), "", "AMPS G");
                    this.addGauge().Set(this.gps.getChildById("Turbo_VoltsGauge1"), this.settings.MainBusVoltage, this.getVoltsBus.bind(this), "", "VOLTS B");
                    this.addGauge().Set(this.gps.getChildById("Turbo_VoltsGauge2"), this.settings.HotBatteryBusVoltage, this.getVoltsBattery.bind(this), "", "VOLTS E");
                    this.addGauge().Set(this.gps.getChildById("Turbo_FuelGaugeLeft"), this.settings.FuelQuantity, this.getFuelL.bind(this), "", "");
                    this.addGauge().Set(this.gps.getChildById("Turbo_FuelGaugeRight"), this.settings.FuelQuantity, this.getFuelR.bind(this), "", "");
                    this.addGauge().Set(this.gps.getChildById("Turbo_DiffPsiGauge"), this.settings.CabinPressureDiff, this.getPressureDiff.bind(this), "", "DIFF PSI");
                    this.addGauge().Set(this.gps.getChildById("Turbo_AltGauge"), this.settings.CabinAltitude, this.getCabinAlt.bind(this), "", "");
                    this.addGauge().Set(this.gps.getChildById("Turbo_RateGauge"), this.settings.CabinAltitudeChangeRate, this.getCabinAltRate.bind(this), "", "");
                    this.addText().Set(this.gps.getChildById("OxyPsiValue"), this.getOxyPressure.bind(this));
                    let trimElevParam = new ColorRangeDisplay();
                    trimElevParam.min = -100;
                    trimElevParam.max = 100;
                    trimElevParam.greenStart = (Simplane.getTrimNeutral() * 100) - 15;
                    trimElevParam.greenEnd = (Simplane.getTrimNeutral() * 100) + 15;
                    this.addGauge().Set(this.gps.getChildById("Turbo_ElevTrim"), trimElevParam, this.getTrimElev.bind(this), "", "");
                    let trimRudderParam = new ColorRangeDisplay4();
                    trimRudderParam.min = -100;
                    trimRudderParam.max = 100;
                    trimRudderParam.greenStart = 20;
                    trimRudderParam.greenEnd = 60;
                    trimRudderParam.whiteStart = -25.5;
                    trimRudderParam.whiteEnd = -6;
                    this.addGauge().Set(this.gps.getChildById("Turbo_RudderTrim"), trimRudderParam, this.getTrimRudder.bind(this), "", "");
                    let trimAilParam = new ColorRangeDisplay4();
                    trimAilParam.min = -100;
                    trimAilParam.max = 100;
                    trimAilParam.whiteStart = -10;
                    trimAilParam.whiteEnd = 10;
                    this.addGauge().Set(this.gps.getChildById("Turbo_AilTrim"), trimAilParam, this.getTrimAil.bind(this), "", "");
                    let flapsParam = new FlapsRangeDisplay();
                    flapsParam.min = 0;
                    flapsParam.max = 34;
                    flapsParam.takeOffValue = 10;
                    this.addGauge().Set(this.gps.getChildById("Turbo_Flaps"), flapsParam, this.getFlapsAngle.bind(this), "", "");
                    var engineRoot = this.root.querySelector("#TurboEngine");
                    if (engineRoot) {
                        for (var i = this.engineCount - 1; i >= 0; i--) {
                            let engine = new AS3000_TurboEngine();
                            TemplateElement.call(engine, this.onEngineReady.bind(this, engine, i));
                            engineRoot.insertBefore(engine, engineRoot.firstChild);
                        }
                    }
                    else {
                        console.error("Unable to find engine root");
                        return;
                    }
                    break;
                }
        }
    }
    onEngineReady(_engine, _index) {
        this.nbEngineReady++;
        switch (this.engineType) {
            case EngineType.ENGINE_TYPE_PISTON:
                {
                    this.addGauge().Set(_engine.querySelector(".Piston_RPMGauge"), this.settings.RPM, this.getRPM.bind(this, _index), "", "RPM");
                    this.addGauge().Set(_engine.querySelector(".Piston_FFlowGauge"), this.settings.FuelFlow, this.getFuelFlow.bind(this, _index), "FFLOW", "GPH");
                    this.addGauge().Set(_engine.querySelector(".Piston_OilPressGauge"), this.settings.FuelFlow, this.getOilPress.bind(this, _index), "OIL PRESS", "");
                    this.addGauge().Set(_engine.querySelector(".Piston_OilTempGauge"), this.settings.OilTemperature, this.getOilTemp.bind(this, _index), "OIL TEMP", "");
                    this.addGauge().Set(_engine.querySelector(".Piston_EgtGauge"), this.settings.EGTTemperature, this.getEGT.bind(this, _index), "EGT", "");
                    break;
                }
            case EngineType.ENGINE_TYPE_TURBOPROP:
            case EngineType.ENGINE_TYPE_JET:
                {
                    this.addGauge().Set(_engine.querySelector(".Turbo_TorqueGauge"), this.settings.Torque, this.getTorque.bind(this, _index), "TRQ", "%");
                    this.addGauge().Set(_engine.querySelector(".Turbo_RPMGauge"), this.settings.RPM, this.getRPM.bind(this, _index), "PROP", "RPM");
                    this.addGauge().Set(_engine.querySelector(".Turbo_NgGauge"), this.settings.TurbineNg, this.getNg.bind(this, _index), "NG", "%", 1);
                    this.addGauge().Set(_engine.querySelector(".Turbo_IttGauge"), this.settings.ITTEngineOff, this.getItt.bind(this, _index), "ITT", "°C");
                    this.addGauge().Set(_engine.querySelector(".Turbo_OilPressGauge"), this.settings.OilPressure, this.getOilPress.bind(this, _index), "OIL PRESS", "");
                    this.addGauge().Set(_engine.querySelector(".Turbo_OilTempGauge"), this.settings.OilTemperature, this.getOilTemp.bind(this, _index), "OIL TEMP", "");
                    this.engineAnnunciations = new Engine_Annunciations();
                    this.allElements.push(this.engineAnnunciations);
                    break;
                }
        }
        if (this.nbEngineReady == this.engineCount) {
            this.allEnginesReady = true;
            this.element = new NavSystemElementGroup(this.allElements);
        }
    }
    reset() {
        if (this.engineAnnunciations) {
            this.engineAnnunciations.reset();
        }
    }
    onUpdate(_deltaTime) {
        if(this.enabled){
            super.onUpdate(_deltaTime);
            if (this.xmlEngineDisplay) {
                this.xmlEngineDisplay.update(_deltaTime);
            }
            this.updateWidth();
        }
    }
    onSoundEnd(_eventId) {
        if (this.xmlEngineDisplay) {
            this.xmlEngineDisplay.onSoundEnd(_eventId);
        }
    }
    onEvent(_event) {
        super.onEvent(_event);
        if (this.xmlEngineDisplay) {
            this.xmlEngineDisplay.onEvent(_event);
            if( _event === "DISABLE_ENGINE_PAGE") {
                console.log("Disabled Engine Page");
                this.enabled = false;
            }
            else if(_event === "ENABLE_ENGINE_PAGE"){
                console.log("Enabled Engine Page");
                this.enabled = true;
            }
        }
    }
    updateWidth() {
        if (!this.root || !this.allEnginesReady || this.widthSet)
            return;
        var vpRect = this.gps.getBoundingClientRect();
        var vpWidth = vpRect.width;
        var vpHeight = vpRect.height;
        if (vpWidth <= 0 || vpHeight <= 0)
            return;
        var width = this.root.offsetWidth;
        if (width <= 0)
            return;
        var newWidth = width * this.engineCount;
        if (width != newWidth) {
            this.root.style.width = width * this.engineCount + "px";
            for (var i = 0; i < this.allElements.length; i++) {
                this.allElements[i].redraw();
            }
        }
        this.widthSet = true;
    }
    addGauge() {
        var newElem = new GaugeElement();
        this.allElements.push(newElem);
        return newElem;
    }
    addText() {
        var newElem = new TextElement();
        this.allElements.push(newElem);
        return newElem;
    }
    initSettings() {
        this.settings = SimVar.GetGameVarValue("", "GlassCockpitSettings");
        if (this.settings) {
            return;
        }
        console.log("Cockpit.cfg not found. Defaulting to standard values...");
        this.settings = new GlassCockpitSettings();
        switch (this.engineType) {
            case EngineType.ENGINE_TYPE_PISTON:
                {
                    this.settings.Vacuum.min = 3.5;
                    this.settings.Vacuum.greenStart = 4.5;
                    this.settings.Vacuum.greenEnd = 5.5;
                    this.settings.Vacuum.max = 7;
                    this.settings.FuelQuantity.min = 0;
                    this.settings.FuelQuantity.greenStart = 5;
                    this.settings.FuelQuantity.greenEnd = 24;
                    this.settings.FuelQuantity.yellowStart = 1.5;
                    this.settings.FuelQuantity.yellowEnd = 5;
                    this.settings.FuelQuantity.redStart = 0;
                    this.settings.FuelQuantity.redEnd = 3;
                    this.settings.FuelQuantity.max = 24;
                    this.settings.RPM.min = 0;
                    this.settings.RPM.greenStart = 2100;
                    this.settings.RPM.greenEnd = 2600;
                    this.settings.RPM.redStart = 2700;
                    this.settings.RPM.redEnd = 3000;
                    this.settings.RPM.max = 3000;
                    this.settings.FuelFlow.min = 0;
                    this.settings.FuelFlow.greenStart = 0;
                    this.settings.FuelFlow.greenEnd = 12;
                    this.settings.FuelFlow.max = 20;
                    this.settings.OilPressure.min = 0;
                    this.settings.OilPressure.lowLimit = 20;
                    this.settings.OilPressure.lowRedStart = 0;
                    this.settings.OilPressure.lowRedEnd = 20;
                    this.settings.OilPressure.greenStart = 50;
                    this.settings.OilPressure.greenEnd = 90;
                    this.settings.OilPressure.redStart = 115;
                    this.settings.OilPressure.redEnd = 120;
                    this.settings.OilPressure.highLimit = 115;
                    this.settings.OilPressure.max = 120;
                    this.settings.OilTemperature.min = 100;
                    this.settings.OilTemperature.lowLimit = 100;
                    this.settings.OilTemperature.greenStart = 100;
                    this.settings.OilTemperature.greenEnd = 245;
                    this.settings.OilTemperature.highLimit = 245;
                    this.settings.OilTemperature.max = 250;
                    this.settings.EGTTemperature.min = 1250;
                    this.settings.EGTTemperature.max = 1650;
                    break;
                }
            case EngineType.ENGINE_TYPE_TURBOPROP:
            case EngineType.ENGINE_TYPE_JET:
                {
                    this.settings.BatteryBusAmps.min = -50;
                    this.settings.BatteryBusAmps.greenStart = -50;
                    this.settings.BatteryBusAmps.greenEnd = 50;
                    this.settings.BatteryBusAmps.yellowStart = 50;
                    this.settings.BatteryBusAmps.yellowEnd = 100;
                    this.settings.BatteryBusAmps.max = 100;
                    this.settings.GenAltBusAmps.min = 0;
                    this.settings.GenAltBusAmps.greenStart = 0;
                    this.settings.GenAltBusAmps.greenEnd = 300;
                    this.settings.GenAltBusAmps.max = 300;
                    this.settings.MainBusVoltage.min = -50;
                    this.settings.MainBusVoltage.lowLimit = 20;
                    this.settings.MainBusVoltage.lowYellowStart = 20;
                    this.settings.MainBusVoltage.lowYellowEnd = 28;
                    this.settings.MainBusVoltage.greenStart = 28;
                    this.settings.MainBusVoltage.greenEnd = 30;
                    this.settings.MainBusVoltage.highLimit = 28;
                    this.settings.MainBusVoltage.max = 50;
                    this.settings.HotBatteryBusVoltage.min = -50;
                    this.settings.HotBatteryBusVoltage.lowLimit = 20;
                    this.settings.HotBatteryBusVoltage.greenStart = 28;
                    this.settings.HotBatteryBusVoltage.greenEnd = 30;
                    this.settings.HotBatteryBusVoltage.yellowStart = 20;
                    this.settings.HotBatteryBusVoltage.yellowEnd = 28;
                    this.settings.HotBatteryBusVoltage.highLimit = 28;
                    this.settings.HotBatteryBusVoltage.max = 50;
                    this.settings.FuelQuantity.min = 0;
                    this.settings.FuelQuantity.greenStart = 9;
                    this.settings.FuelQuantity.greenEnd = 150;
                    this.settings.FuelQuantity.yellowStart = 1;
                    this.settings.FuelQuantity.yellowEnd = 9;
                    this.settings.FuelQuantity.redStart = 0;
                    this.settings.FuelQuantity.redEnd = 1;
                    this.settings.FuelQuantity.max = 150;
                    this.settings.Torque.min = 0;
                    this.settings.Torque.greenStart = 0;
                    this.settings.Torque.greenEnd = 100;
                    this.settings.Torque.yellowStart = 100;
                    this.settings.Torque.yellowEnd = 101;
                    this.settings.Torque.redStart = 101;
                    this.settings.Torque.redEnd = 102;
                    this.settings.Torque.max = 110;
                    this.settings.RPM.min = 0;
                    this.settings.RPM.greenStart = 1950;
                    this.settings.RPM.greenEnd = 2050;
                    this.settings.RPM.yellowStart = 450;
                    this.settings.RPM.yellowEnd = 1000;
                    this.settings.RPM.redStart = 2050;
                    this.settings.RPM.redEnd = 2051;
                    this.settings.RPM.max = 2200;
                    this.settings.TurbineNg.min = 0;
                    this.settings.TurbineNg.greenStart = 51;
                    this.settings.TurbineNg.greenEnd = 104;
                    this.settings.TurbineNg.redStart = 104;
                    this.settings.TurbineNg.redEnd = 105;
                    this.settings.TurbineNg.max = 110;
                    this.settings.ITTEngineOff.min = 0;
                    this.settings.ITTEngineOff.greenStart = 752;
                    this.settings.ITTEngineOff.greenEnd = 1544;
                    this.settings.ITTEngineOff.redStart = 1545;
                    this.settings.ITTEngineOff.redEnd = 1652;
                    this.settings.ITTEngineOff.max = 1995;
                    this.settings.OilPressure.min = 0;
                    this.settings.OilPressure.lowLimit = 60;
                    this.settings.OilPressure.greenStart = 105;
                    this.settings.OilPressure.greenEnd = 135;
                    this.settings.OilPressure.yellowStart = 60;
                    this.settings.OilPressure.yellowEnd = 105;
                    this.settings.OilPressure.redStart = 135;
                    this.settings.OilPressure.redEnd = 136;
                    this.settings.OilPressure.highLimit = 135;
                    this.settings.OilPressure.max = 170;
                    this.settings.OilTemperature.min = -50;
                    this.settings.OilTemperature.lowLimit = -40;
                    this.settings.OilTemperature.greenStart = 32;
                    this.settings.OilTemperature.greenEnd = 219;
                    this.settings.OilTemperature.highLimit = 238;
                    this.settings.OilTemperature.max = 248;
                    break;
                }
        }
    }
    getRPM(_index) {
        return Simplane.getEngineRPM(_index);
    }
    getTorque(_index) {
        return Simplane.getEnginePower(_index);
    }
    getNg(_index) {
        var engineId = _index + 1;
        return SimVar.GetSimVarValue("TURB ENG N1:" + engineId, "percent");
    }
    getItt(_index) {
        switch (_index) {
            case 1: return SimVar.GetSimVarValue("TURB ENG2 ITT", "celsius");
            case 2: return SimVar.GetSimVarValue("TURB ENG3 ITT", "celsius");
            case 3: return SimVar.GetSimVarValue("TURB ENG4 ITT", "celsius");
        }
        return SimVar.GetSimVarValue("TURB ENG1 ITT", "celsius");
    }
    getFuelFlow(_index) {
        var engineId = _index + 1;
        return SimVar.GetSimVarValue("ENG FUEL FLOW GPH:" + engineId, "gallons per hour");
    }
    getOilPress(_index) {
        var engineId = _index + 1;
        return SimVar.GetSimVarValue("GENERAL ENG OIL PRESSURE:" + engineId, "psi");
    }
    getOilTemp(_index) {
        var engineId = _index + 1;
        return SimVar.GetSimVarValue("GENERAL ENG OIL TEMPERATURE:" + engineId, "celsius");
    }
    getEGT(_index) {
        var engineId = _index + 1;
        return SimVar.GetSimVarValue("GENERAL ENG EXHAUST GAS TEMPERATURE:" + engineId, "farenheit");
    }
    getVAC() {
        return SimVar.GetSimVarValue("SUCTION PRESSURE", "inch of mercury");
    }
    getAmpsBattery() {
        return fastToFixed(SimVar.GetSimVarValue("ELECTRICAL BATTERY BUS AMPS", "amperes"), 0);
    }
    getAmpsGenAlt() {
        return fastToFixed(SimVar.GetSimVarValue("ELECTRICAL GENALT BUS AMPS:1", "amperes"), 0);
    }
    getVoltsBus() {
        return fastToFixed(SimVar.GetSimVarValue("ELECTRICAL MAIN BUS VOLTAGE", "volts"), 0);
    }
    getVoltsBattery() {
        return fastToFixed(SimVar.GetSimVarValue("ELECTRICAL HOT BATTERY BUS VOLTAGE", "volts"), 0);
    }
    getFuelL() {
        return SimVar.GetSimVarValue("FUEL LEFT QUANTITY", "gallons");
    }
    getFuelR() {
        return SimVar.GetSimVarValue("FUEL RIGHT QUANTITY", "gallons");
    }
    getCabinAlt() {
        return SimVar.GetSimVarValue("PRESSURIZATION CABIN ALTITUDE", "feet");
    }
    getCabinAltRate() {
        return SimVar.GetSimVarValue("PRESSURIZATION CABIN ALTITUDE RATE", "feet per minute");
    }
    getPressureDiff() {
        return SimVar.GetSimVarValue("PRESSURIZATION PRESSURE DIFFERENTIAL", "psi");
    }
    getEngineHours() {
        var totalSeconds = SimVar.GetSimVarValue("GENERAL ENG ELAPSED TIME:1", "seconds");
        var hours = Math.floor(totalSeconds / 3600);
        var remainingSeconds = totalSeconds - (hours * 3600);
        hours += Math.floor((remainingSeconds / 3600) * 10) / 10;
        return hours;
    }
    getFlapsAngle() {
        return SimVar.GetSimVarValue("TRAILING EDGE FLAPS LEFT ANGLE", "degree");
    }
    getTrimElev() {
        return SimVar.GetSimVarValue("ELEVATOR TRIM PCT", "percent");
    }
    getTrimRudder() {
        return SimVar.GetSimVarValue("RUDDER TRIM PCT", "percent");
    }
    getTrimAil() {
        return SimVar.GetSimVarValue("AILERON TRIM PCT", "percent");
    }
    getOxyPressure() {
        return "----";
    }
}
class SMFD_Fuel extends NavSystemElementContainer {
    constructor(_name, _root) {
        super(_name, _root, null);
        this.nbEngineReady = 0;
        this.allElements = [];
        this.allEnginesReady = false;
        this.widthSet = false;
        this.xmlEngineDisplay = null;
        this.enabled = true;
    }
    init() {
        super.init();
        this.root = this.gps.getChildById(this.htmlElemId);
        if (!this.root) {
            console.error("Root component expected!");
            return;
        }
        let fromConfig = false;
        if (this.gps.xmlConfig) {
            let engineRoot = this.gps.xmlConfig.getElementsByTagName("FuelDisplay");
            if (engineRoot.length > 0) {
                fromConfig = true;
                this.root.setAttribute("state", "XML");
                this.xmlEngineDisplay = this.root.querySelector("glasscockpit-xmlenginedisplay");
                this.xmlEngineDisplay.setConfiguration(this.gps, engineRoot[0]);
            }
        }
        if (!fromConfig) {
            this.engineType = Simplane.getEngineType();
            this.engineCount = Simplane.getEngineCount();
            var fd = this.root.querySelector("as3000-engine-display");
            if (!fd) {
                console.error("Fuel Display component expected!");
                return;
            }
            TemplateElement.call(fd, this.initEngines.bind(this));
        }
    }
    initEngines() {
        this.initSettings();
        switch (this.engineType) {
            case EngineType.ENGINE_TYPE_PISTON:
                {
                    this.root.setAttribute("state", "piston");
                    this.addGauge().Set(this.gps.getChildById("Piston_VacGauge"), this.settings.Vacuum, this.getVAC.bind(this), "VAC", "inHg");
                    this.addGauge().Set(this.gps.getChildById("Piston_FuelGaugeL"), this.settings.FuelQuantity, this.getFuelL.bind(this), "L FUEL QTY", "GAL");
                    this.addGauge().Set(this.gps.getChildById("Piston_FuelGaugeR"), this.settings.FuelQuantity, this.getFuelR.bind(this), "R FUEL QTY", "GAL");
                    this.addText().Set(this.gps.getChildById("Piston_EngineHours"), this.getEngineHours.bind(this));
                    this.addText().Set(this.gps.getChildById("Piston_Bus_M"), this.getVoltsBus.bind(this));
                    this.addText().Set(this.gps.getChildById("Piston_Bus_E"), this.getVoltsBattery.bind(this));
                    this.addText().Set(this.gps.getChildById("Piston_Batt_M"), this.getAmpsBattery.bind(this));
                    this.addText().Set(this.gps.getChildById("Piston_Batt_S"), this.getAmpsGenAlt.bind(this));
                    var engineRoot = this.root.querySelector("#PistonEnginesPanel");
                    if (engineRoot) {
                        for (var i = 0; i < this.engineCount; i++) {
                            let engine = new AS3000_PistonEngine();
                            TemplateElement.call(engine, this.onEngineReady.bind(this, engine, i));
                            engineRoot.appendChild(engine);
                        }
                    }
                    else {
                        console.error("Unable to find engine root");
                        return;
                    }
                    break;
                }
            case EngineType.ENGINE_TYPE_TURBOPROP:
            case EngineType.ENGINE_TYPE_JET:
                {
                    this.root.setAttribute("state", "turbo");
                    this.addGauge().Set(this.gps.getChildById("Turbo_AmpGauge1"), this.settings.BatteryBusAmps, this.getAmpsBattery.bind(this), "", "AMPS B");
                    this.addGauge().Set(this.gps.getChildById("Turbo_AmpGauge2"), this.settings.GenAltBusAmps, this.getAmpsGenAlt.bind(this), "", "AMPS G");
                    this.addGauge().Set(this.gps.getChildById("Turbo_VoltsGauge1"), this.settings.MainBusVoltage, this.getVoltsBus.bind(this), "", "VOLTS B");
                    this.addGauge().Set(this.gps.getChildById("Turbo_VoltsGauge2"), this.settings.HotBatteryBusVoltage, this.getVoltsBattery.bind(this), "", "VOLTS E");
                    this.addGauge().Set(this.gps.getChildById("Turbo_FuelGaugeLeft"), this.settings.FuelQuantity, this.getFuelL.bind(this), "", "");
                    this.addGauge().Set(this.gps.getChildById("Turbo_FuelGaugeRight"), this.settings.FuelQuantity, this.getFuelR.bind(this), "", "");
                    this.addGauge().Set(this.gps.getChildById("Turbo_DiffPsiGauge"), this.settings.CabinPressureDiff, this.getPressureDiff.bind(this), "", "DIFF PSI");
                    this.addGauge().Set(this.gps.getChildById("Turbo_AltGauge"), this.settings.CabinAltitude, this.getCabinAlt.bind(this), "", "");
                    this.addGauge().Set(this.gps.getChildById("Turbo_RateGauge"), this.settings.CabinAltitudeChangeRate, this.getCabinAltRate.bind(this), "", "");
                    this.addText().Set(this.gps.getChildById("OxyPsiValue"), this.getOxyPressure.bind(this));
                    let trimElevParam = new ColorRangeDisplay();
                    trimElevParam.min = -100;
                    trimElevParam.max = 100;
                    trimElevParam.greenStart = (Simplane.getTrimNeutral() * 100) - 15;
                    trimElevParam.greenEnd = (Simplane.getTrimNeutral() * 100) + 15;
                    this.addGauge().Set(this.gps.getChildById("Turbo_ElevTrim"), trimElevParam, this.getTrimElev.bind(this), "", "");
                    let trimRudderParam = new ColorRangeDisplay4();
                    trimRudderParam.min = -100;
                    trimRudderParam.max = 100;
                    trimRudderParam.greenStart = 20;
                    trimRudderParam.greenEnd = 60;
                    trimRudderParam.whiteStart = -25.5;
                    trimRudderParam.whiteEnd = -6;
                    this.addGauge().Set(this.gps.getChildById("Turbo_RudderTrim"), trimRudderParam, this.getTrimRudder.bind(this), "", "");
                    let trimAilParam = new ColorRangeDisplay4();
                    trimAilParam.min = -100;
                    trimAilParam.max = 100;
                    trimAilParam.whiteStart = -10;
                    trimAilParam.whiteEnd = 10;
                    this.addGauge().Set(this.gps.getChildById("Turbo_AilTrim"), trimAilParam, this.getTrimAil.bind(this), "", "");
                    let flapsParam = new FlapsRangeDisplay();
                    flapsParam.min = 0;
                    flapsParam.max = 34;
                    flapsParam.takeOffValue = 10;
                    this.addGauge().Set(this.gps.getChildById("Turbo_Flaps"), flapsParam, this.getFlapsAngle.bind(this), "", "");
                    var engineRoot = this.root.querySelector("#TurboEngine");
                    if (engineRoot) {
                        for (var i = this.engineCount - 1; i >= 0; i--) {
                            let engine = new AS3000_TurboEngine();
                            TemplateElement.call(engine, this.onEngineReady.bind(this, engine, i));
                            engineRoot.insertBefore(engine, engineRoot.firstChild);
                        }
                    }
                    else {
                        console.error("Unable to find engine root");
                        return;
                    }
                    break;
                }
        }
    }
    onEngineReady(_engine, _index) {
        this.nbEngineReady++;
        switch (this.engineType) {
            case EngineType.ENGINE_TYPE_PISTON:
                {
                    this.addGauge().Set(_engine.querySelector(".Piston_RPMGauge"), this.settings.RPM, this.getRPM.bind(this, _index), "", "RPM");
                    this.addGauge().Set(_engine.querySelector(".Piston_FFlowGauge"), this.settings.FuelFlow, this.getFuelFlow.bind(this, _index), "FFLOW", "GPH");
                    this.addGauge().Set(_engine.querySelector(".Piston_OilPressGauge"), this.settings.FuelFlow, this.getOilPress.bind(this, _index), "OIL PRESS", "");
                    this.addGauge().Set(_engine.querySelector(".Piston_OilTempGauge"), this.settings.OilTemperature, this.getOilTemp.bind(this, _index), "OIL TEMP", "");
                    this.addGauge().Set(_engine.querySelector(".Piston_EgtGauge"), this.settings.EGTTemperature, this.getEGT.bind(this, _index), "EGT", "");
                    break;
                }
            case EngineType.ENGINE_TYPE_TURBOPROP:
            case EngineType.ENGINE_TYPE_JET:
                {
                    this.addGauge().Set(_engine.querySelector(".Turbo_TorqueGauge"), this.settings.Torque, this.getTorque.bind(this, _index), "TRQ", "%");
                    this.addGauge().Set(_engine.querySelector(".Turbo_RPMGauge"), this.settings.RPM, this.getRPM.bind(this, _index), "PROP", "RPM");
                    this.addGauge().Set(_engine.querySelector(".Turbo_NgGauge"), this.settings.TurbineNg, this.getNg.bind(this, _index), "NG", "%", 1);
                    this.addGauge().Set(_engine.querySelector(".Turbo_IttGauge"), this.settings.ITTEngineOff, this.getItt.bind(this, _index), "ITT", "°C");
                    this.addGauge().Set(_engine.querySelector(".Turbo_OilPressGauge"), this.settings.OilPressure, this.getOilPress.bind(this, _index), "OIL PRESS", "");
                    this.addGauge().Set(_engine.querySelector(".Turbo_OilTempGauge"), this.settings.OilTemperature, this.getOilTemp.bind(this, _index), "OIL TEMP", "");
                    this.engineAnnunciations = new Engine_Annunciations();
                    this.allElements.push(this.engineAnnunciations);
                    break;
                }
        }
        if (this.nbEngineReady == this.engineCount) {
            this.allEnginesReady = true;
            this.element = new NavSystemElementGroup(this.allElements);
        }
    }
    reset() {
        if (this.engineAnnunciations) {
            this.engineAnnunciations.reset();
        }
    }
    onUpdate(_deltaTime) {
        if(this.enabled){
            super.onUpdate(_deltaTime);
            if (this.xmlEngineDisplay) {
                this.xmlEngineDisplay.update(_deltaTime);
            }
            this.updateWidth();
        }
    }
    onSoundEnd(_eventId) {
        if (this.xmlEngineDisplay) {
            this.xmlEngineDisplay.onSoundEnd(_eventId);
        }
    }
    onEvent(_event) {
        super.onEvent(_event);
        if (this.xmlEngineDisplay) {
            this.xmlEngineDisplay.onEvent(_event);
            if( _event === "DISABLE_FUEL_PAGE") {
                console.log("Disabled Fuel Page");
                this.enabled = false;
            }
            else if(_event === "ENABLE_FUEL_PAGE"){
                console.log("Enabled Fuel Page");
                this.enabled = true;
            }
        }
    }
    updateWidth() {
        if (!this.root || !this.allEnginesReady || this.widthSet)
            return;
        var vpRect = this.gps.getBoundingClientRect();
        var vpWidth = vpRect.width;
        var vpHeight = vpRect.height;
        if (vpWidth <= 0 || vpHeight <= 0)
            return;
        var width = this.root.offsetWidth;
        if (width <= 0)
            return;
        var newWidth = width * this.engineCount;
        if (width != newWidth) {
            this.root.style.width = width * this.engineCount + "px";
            for (var i = 0; i < this.allElements.length; i++) {
                this.allElements[i].redraw();
            }
        }
        this.widthSet = true;
    }
    addGauge() {
        var newElem = new GaugeElement();
        this.allElements.push(newElem);
        return newElem;
    }
    addText() {
        var newElem = new TextElement();
        this.allElements.push(newElem);
        return newElem;
    }
    initSettings() {
        this.settings = SimVar.GetGameVarValue("", "GlassCockpitSettings");
        if (this.settings) {
            return;
        }
        console.log("Cockpit.cfg not found. Defaulting to standard values...");
        this.settings = new GlassCockpitSettings();
        switch (this.engineType) {
            case EngineType.ENGINE_TYPE_PISTON:
                {
                    this.settings.Vacuum.min = 3.5;
                    this.settings.Vacuum.greenStart = 4.5;
                    this.settings.Vacuum.greenEnd = 5.5;
                    this.settings.Vacuum.max = 7;
                    this.settings.FuelQuantity.min = 0;
                    this.settings.FuelQuantity.greenStart = 5;
                    this.settings.FuelQuantity.greenEnd = 24;
                    this.settings.FuelQuantity.yellowStart = 1.5;
                    this.settings.FuelQuantity.yellowEnd = 5;
                    this.settings.FuelQuantity.redStart = 0;
                    this.settings.FuelQuantity.redEnd = 3;
                    this.settings.FuelQuantity.max = 24;
                    this.settings.RPM.min = 0;
                    this.settings.RPM.greenStart = 2100;
                    this.settings.RPM.greenEnd = 2600;
                    this.settings.RPM.redStart = 2700;
                    this.settings.RPM.redEnd = 3000;
                    this.settings.RPM.max = 3000;
                    this.settings.FuelFlow.min = 0;
                    this.settings.FuelFlow.greenStart = 0;
                    this.settings.FuelFlow.greenEnd = 12;
                    this.settings.FuelFlow.max = 20;
                    this.settings.OilPressure.min = 0;
                    this.settings.OilPressure.lowLimit = 20;
                    this.settings.OilPressure.lowRedStart = 0;
                    this.settings.OilPressure.lowRedEnd = 20;
                    this.settings.OilPressure.greenStart = 50;
                    this.settings.OilPressure.greenEnd = 90;
                    this.settings.OilPressure.redStart = 115;
                    this.settings.OilPressure.redEnd = 120;
                    this.settings.OilPressure.highLimit = 115;
                    this.settings.OilPressure.max = 120;
                    this.settings.OilTemperature.min = 100;
                    this.settings.OilTemperature.lowLimit = 100;
                    this.settings.OilTemperature.greenStart = 100;
                    this.settings.OilTemperature.greenEnd = 245;
                    this.settings.OilTemperature.highLimit = 245;
                    this.settings.OilTemperature.max = 250;
                    this.settings.EGTTemperature.min = 1250;
                    this.settings.EGTTemperature.max = 1650;
                    break;
                }
            case EngineType.ENGINE_TYPE_TURBOPROP:
            case EngineType.ENGINE_TYPE_JET:
                {
                    this.settings.BatteryBusAmps.min = -50;
                    this.settings.BatteryBusAmps.greenStart = -50;
                    this.settings.BatteryBusAmps.greenEnd = 50;
                    this.settings.BatteryBusAmps.yellowStart = 50;
                    this.settings.BatteryBusAmps.yellowEnd = 100;
                    this.settings.BatteryBusAmps.max = 100;
                    this.settings.GenAltBusAmps.min = 0;
                    this.settings.GenAltBusAmps.greenStart = 0;
                    this.settings.GenAltBusAmps.greenEnd = 300;
                    this.settings.GenAltBusAmps.max = 300;
                    this.settings.MainBusVoltage.min = -50;
                    this.settings.MainBusVoltage.lowLimit = 20;
                    this.settings.MainBusVoltage.lowYellowStart = 20;
                    this.settings.MainBusVoltage.lowYellowEnd = 28;
                    this.settings.MainBusVoltage.greenStart = 28;
                    this.settings.MainBusVoltage.greenEnd = 30;
                    this.settings.MainBusVoltage.highLimit = 28;
                    this.settings.MainBusVoltage.max = 50;
                    this.settings.HotBatteryBusVoltage.min = -50;
                    this.settings.HotBatteryBusVoltage.lowLimit = 20;
                    this.settings.HotBatteryBusVoltage.greenStart = 28;
                    this.settings.HotBatteryBusVoltage.greenEnd = 30;
                    this.settings.HotBatteryBusVoltage.yellowStart = 20;
                    this.settings.HotBatteryBusVoltage.yellowEnd = 28;
                    this.settings.HotBatteryBusVoltage.highLimit = 28;
                    this.settings.HotBatteryBusVoltage.max = 50;
                    this.settings.FuelQuantity.min = 0;
                    this.settings.FuelQuantity.greenStart = 9;
                    this.settings.FuelQuantity.greenEnd = 150;
                    this.settings.FuelQuantity.yellowStart = 1;
                    this.settings.FuelQuantity.yellowEnd = 9;
                    this.settings.FuelQuantity.redStart = 0;
                    this.settings.FuelQuantity.redEnd = 1;
                    this.settings.FuelQuantity.max = 150;
                    this.settings.Torque.min = 0;
                    this.settings.Torque.greenStart = 0;
                    this.settings.Torque.greenEnd = 100;
                    this.settings.Torque.yellowStart = 100;
                    this.settings.Torque.yellowEnd = 101;
                    this.settings.Torque.redStart = 101;
                    this.settings.Torque.redEnd = 102;
                    this.settings.Torque.max = 110;
                    this.settings.RPM.min = 0;
                    this.settings.RPM.greenStart = 1950;
                    this.settings.RPM.greenEnd = 2050;
                    this.settings.RPM.yellowStart = 450;
                    this.settings.RPM.yellowEnd = 1000;
                    this.settings.RPM.redStart = 2050;
                    this.settings.RPM.redEnd = 2051;
                    this.settings.RPM.max = 2200;
                    this.settings.TurbineNg.min = 0;
                    this.settings.TurbineNg.greenStart = 51;
                    this.settings.TurbineNg.greenEnd = 104;
                    this.settings.TurbineNg.redStart = 104;
                    this.settings.TurbineNg.redEnd = 105;
                    this.settings.TurbineNg.max = 110;
                    this.settings.ITTEngineOff.min = 0;
                    this.settings.ITTEngineOff.greenStart = 752;
                    this.settings.ITTEngineOff.greenEnd = 1544;
                    this.settings.ITTEngineOff.redStart = 1545;
                    this.settings.ITTEngineOff.redEnd = 1652;
                    this.settings.ITTEngineOff.max = 1995;
                    this.settings.OilPressure.min = 0;
                    this.settings.OilPressure.lowLimit = 60;
                    this.settings.OilPressure.greenStart = 105;
                    this.settings.OilPressure.greenEnd = 135;
                    this.settings.OilPressure.yellowStart = 60;
                    this.settings.OilPressure.yellowEnd = 105;
                    this.settings.OilPressure.redStart = 135;
                    this.settings.OilPressure.redEnd = 136;
                    this.settings.OilPressure.highLimit = 135;
                    this.settings.OilPressure.max = 170;
                    this.settings.OilTemperature.min = -50;
                    this.settings.OilTemperature.lowLimit = -40;
                    this.settings.OilTemperature.greenStart = 32;
                    this.settings.OilTemperature.greenEnd = 219;
                    this.settings.OilTemperature.highLimit = 238;
                    this.settings.OilTemperature.max = 248;
                    break;
                }
        }
    }
    getRPM(_index) {
        return Simplane.getEngineRPM(_index);
    }
    getTorque(_index) {
        return Simplane.getEnginePower(_index);
    }
    getNg(_index) {
        var engineId = _index + 1;
        return SimVar.GetSimVarValue("TURB ENG N1:" + engineId, "percent");
    }
    getItt(_index) {
        switch (_index) {
            case 1: return SimVar.GetSimVarValue("TURB ENG2 ITT", "celsius");
            case 2: return SimVar.GetSimVarValue("TURB ENG3 ITT", "celsius");
            case 3: return SimVar.GetSimVarValue("TURB ENG4 ITT", "celsius");
        }
        return SimVar.GetSimVarValue("TURB ENG1 ITT", "celsius");
    }
    getFuelFlow(_index) {
        var engineId = _index + 1;
        return SimVar.GetSimVarValue("ENG FUEL FLOW GPH:" + engineId, "gallons per hour");
    }
    getOilPress(_index) {
        var engineId = _index + 1;
        return SimVar.GetSimVarValue("GENERAL ENG OIL PRESSURE:" + engineId, "psi");
    }
    getOilTemp(_index) {
        var engineId = _index + 1;
        return SimVar.GetSimVarValue("GENERAL ENG OIL TEMPERATURE:" + engineId, "celsius");
    }
    getEGT(_index) {
        var engineId = _index + 1;
        return SimVar.GetSimVarValue("GENERAL ENG EXHAUST GAS TEMPERATURE:" + engineId, "farenheit");
    }
    getVAC() {
        return SimVar.GetSimVarValue("SUCTION PRESSURE", "inch of mercury");
    }
    getAmpsBattery() {
        return fastToFixed(SimVar.GetSimVarValue("ELECTRICAL BATTERY BUS AMPS", "amperes"), 0);
    }
    getAmpsGenAlt() {
        return fastToFixed(SimVar.GetSimVarValue("ELECTRICAL GENALT BUS AMPS:1", "amperes"), 0);
    }
    getVoltsBus() {
        return fastToFixed(SimVar.GetSimVarValue("ELECTRICAL MAIN BUS VOLTAGE", "volts"), 0);
    }
    getVoltsBattery() {
        return fastToFixed(SimVar.GetSimVarValue("ELECTRICAL HOT BATTERY BUS VOLTAGE", "volts"), 0);
    }
    getFuelL() {
        return SimVar.GetSimVarValue("FUEL LEFT QUANTITY", "gallons");
    }
    getFuelR() {
        return SimVar.GetSimVarValue("FUEL RIGHT QUANTITY", "gallons");
    }
    getCabinAlt() {
        return SimVar.GetSimVarValue("PRESSURIZATION CABIN ALTITUDE", "feet");
    }
    getCabinAltRate() {
        return SimVar.GetSimVarValue("PRESSURIZATION CABIN ALTITUDE RATE", "feet per minute");
    }
    getPressureDiff() {
        return SimVar.GetSimVarValue("PRESSURIZATION PRESSURE DIFFERENTIAL", "psi");
    }
    getEngineHours() {
        var totalSeconds = SimVar.GetSimVarValue("GENERAL ENG ELAPSED TIME:1", "seconds");
        var hours = Math.floor(totalSeconds / 3600);
        var remainingSeconds = totalSeconds - (hours * 3600);
        hours += Math.floor((remainingSeconds / 3600) * 10) / 10;
        return hours;
    }
    getFlapsAngle() {
        return SimVar.GetSimVarValue("TRAILING EDGE FLAPS LEFT ANGLE", "degree");
    }
    getTrimElev() {
        return SimVar.GetSimVarValue("ELEVATOR TRIM PCT", "percent");
    }
    getTrimRudder() {
        return SimVar.GetSimVarValue("RUDDER TRIM PCT", "percent");
    }
    getTrimAil() {
        return SimVar.GetSimVarValue("AILERON TRIM PCT", "percent");
    }
    getOxyPressure() {
        return "----";
    }
}
class SMFD_Weapons extends NavSystemElementContainer {
    constructor(_name, _root) {
        super(_name, _root, null);
        this.mainDoorStatus = lbl_shut;
        this.leftDoorStatus = lbl_shut;
        this.rightDoorStatus = lbl_shut;
        this.jammerStatus = lbl_shut;
        this.flareStatus = lbl_shut;
    }
}
class SMFD_Page_Display extends NavSystemElement {
    constructor() {
        super(...arguments);
        this.page = 0;
    }
    init(root) {
        this.EnginesElement = this.gps.getChildById("EnginePage");
        //SimVar.SetSimVarValue("L:Glasscockpit_MFD_Page", "number", this.page);
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
		console.log("Update");
    }
    onExit() {
    }
    onEvent(_event) {
		console.log("Page Event Flagged");
        if (_event == "SoftKey_SMFD_NewPage_Engines") {
            this.EnginesElement.style.display = "block";
        } 
        else if (_event == "SoftKey_SMFD_NewPage_Fuel") {
            this.EnginesElement.style.display = "none";
        }
        //SimVar.SetSimVarValue("L:Glasscockpit_AOA_Mode", "number", this.page);
    }
}
registerInstrument("smfd-element", SMFD);
//# sourceMappingURL=SMFD.js.map