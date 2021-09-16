class HUD extends NavSystem {
    constructor() {
        super();
        this.initDuration = 100;
        this.mainFrame = null;
    }
    get IsGlassCockpit() { return true; }
    get templateID() { return "HUD"; }
    connectedCallback() {
        super.connectedCallback();
        this.mainFrame = document.getElementById("Mainframe");

        this.mainPage = new HUD_MainPage();
        this.pageGroups = [
            new NavSystemPageGroup("Main", this, [
                this.mainPage
            ]),
        ];
        this.maxUpdateBudget = 12;
    }
    disconnectedCallback() {
        super.disconnectedCallback();
    }    
    CanUpdate() {
        super.CanUpdate();
        var quality = Quality.ultra;
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
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
    }
    reboot() {
        super.reboot();
        if (this.mainPage)
            this.mainPage.reset();
    }
}
class HUD_MainPage extends NavSystemPage {
    constructor() {
        super("Main", "Mainframe", new HUD_MainElement());
        this.attitude = new HUD_Attitude();
        this.element = new NavSystemElementGroup([
            this.attitude,
			new HUD_Heading(),
			new HUD_GForce(),
            new HUD_Airspeed(),
            new HUD_Altimeter(),
            new HUD_Compass()
        ]);
    }
    init() {
        super.init();
    }
    reset() {
    }
    constElement(_elem) {
        return _elem;
    }
}
class HUD_MainElement extends NavSystemElement {
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
class HUD_Heading extends NavSystemElement {
    constructor() {
        super(...arguments);
    }
    init(root) {
        this.svg = this.gps.getChildById("Heading");
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        var heading = SimVar.GetSimVarValue("PLANE HEADING DEGREES TRUE", "degree");
        if (heading) {
            this.svg.setAttribute("heading", heading.toString());
        }
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
class HUD_GForce extends NavSystemElement {
    constructor() {
        super(...arguments);
    }
    init(root) {
        this.svg = this.gps.getChildById("GForce");
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        var gforce = SimVar.GetSimVarValue("G FORCE", "GForce");
        if (gforce) {
            this.svg.setAttribute("gforce", gforce.toString());
        }
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
class HUD_Attitude extends NavSystemElement {
    constructor() {
        super(...arguments);
        this.fdActive = false;
        this.fdDisabled = true;
    }
    init(root) {
        this.svg = this.gps.getChildById("Horizon");
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        var xyz = Simplane.getOrientationAxis();
        if (xyz) {
            this.svg.setAttribute("pitch", (xyz.pitch / Math.PI * 180).toString());
            this.svg.setAttribute("bank", (xyz.bank / Math.PI * 180).toString());
            this.svg.setAttribute("slip_skid", SimVar.GetSimVarValue("INCIDENCE BETA", "radians"));
            this.svg.setAttribute("aoa", SimVar.GetSimVarValue("INCIDENCE ALPHA", "radians"));
            this.fdActive = SimVar.GetSimVarValue("L:XMLVAR_EBD_HUD_FD", "boolean");

            // The following should save performance by preventing unneeded calls to update svgs
            // and unneeded SimVar calls.
            if(this.fdActive){
                this.fdDisabled = false;
                this.svg.setAttribute("flight_director-active", "true");
                this.svg.setAttribute("flight_director-pitch", SimVar.GetSimVarValue("AUTOPILOT FLIGHT DIRECTOR PITCH", "degree"));
                this.svg.setAttribute("flight_director-bank", SimVar.GetSimVarValue("AUTOPILOT FLIGHT DIRECTOR BANK", "degree"));
            }
            else if(!this.fdDisabled){
                this.svg.setAttribute("flight_director-active", "false");
                this.fdDisabled = true;
            }
            let gearPosition = SimVar.GetSimVarValue("GEAR CENTER POSITION", "percent");
            if(gearPosition != 0){
                this.svg.setAttribute("gear-down", "true");
            }
            else {
                this.svg.setAttribute("gear-down", "false");
            }
        }
    }
    onEvent(_event) {
    }
    onExit() {
    }
}
class HUD_Airspeed extends NavSystemElement {
    constructor() {
        super();
        this.lastIndicatedSpeed = -10000;
        this.lastMachSpeed = -10000;
        this.acceleration = 0;
        this.lastSpeed = null;
        this.alwaysDisplaySpeed = true;
    }
    init(root) {
        this.airspeedElement = this.gps.getChildById("Airspeed");
        var cockpitSettings = SimVar.GetGameVarValue("", "GlassCockpitSettings");
        if (cockpitSettings && cockpitSettings.AirSpeed.Initialized) {
            this.airspeedElement.setAttribute("min-speed", cockpitSettings.AirSpeed.lowLimit.toString());
            this.airspeedElement.setAttribute("green-begin", cockpitSettings.AirSpeed.greenStart.toString());
            this.airspeedElement.setAttribute("green-end", cockpitSettings.AirSpeed.greenEnd.toString());
            this.airspeedElement.setAttribute("flaps-begin", cockpitSettings.AirSpeed.whiteStart.toString());
            this.airspeedElement.setAttribute("flaps-end", cockpitSettings.AirSpeed.whiteEnd.toString());
            this.airspeedElement.setAttribute("yellow-begin", cockpitSettings.AirSpeed.yellowStart.toString());
            this.airspeedElement.setAttribute("yellow-end", cockpitSettings.AirSpeed.yellowEnd.toString());
            this.airspeedElement.setAttribute("red-begin", cockpitSettings.AirSpeed.redStart.toString());
            this.airspeedElement.setAttribute("red-end", cockpitSettings.AirSpeed.redEnd.toString());
            this.airspeedElement.setAttribute("max-speed", cockpitSettings.AirSpeed.highLimit.toString());
            this.maxSpeed = cockpitSettings.AirSpeed.highLimit;
        }
        else {
            var designSpeeds = Simplane.getDesignSpeeds();
            this.airspeedElement.setAttribute("green-begin", designSpeeds.VS1.toString());
            this.airspeedElement.setAttribute("green-end", designSpeeds.VNo.toString());
            this.airspeedElement.setAttribute("flaps-begin", designSpeeds.VS0.toString());
            this.airspeedElement.setAttribute("flaps-end", designSpeeds.VFe.toString());
            this.airspeedElement.setAttribute("yellow-begin", designSpeeds.VNo.toString());
            this.airspeedElement.setAttribute("yellow-end", designSpeeds.VNe.toString());
            this.airspeedElement.setAttribute("red-begin", designSpeeds.VNe.toString());
            this.airspeedElement.setAttribute("red-end", designSpeeds.VMax.toString());
            this.airspeedElement.setAttribute("max-speed", designSpeeds.VNe.toString());
            this.maxSpeed = designSpeeds.VNe;
        }
        if (this.gps.instrumentXmlConfig) {
            let autoThrottleElem = this.gps.instrumentXmlConfig.getElementsByTagName("AutoThrottle");
            if (autoThrottleElem.length > 0) {
                this.alwaysDisplaySpeed = autoThrottleElem[0].textContent == "True";
            }
        }
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        var indicatedSpeed = Simplane.getIndicatedSpeed();
        if (indicatedSpeed != this.lastIndicatedSpeed) {
            this.airspeedElement.setAttribute("airspeed", indicatedSpeed.toFixed(1));
            this.lastIndicatedSpeed = indicatedSpeed;
        }
        var machSpeed = Simplane.getMachSpeed();
        if (machSpeed != this.lastMachSpeed) {
            this.airspeedElement.setAttribute("mach-airspeed", machSpeed.toFixed(3));
            this.lastMachSpeed = machSpeed;
        }
        this.airspeedElement.setAttribute("display-ref-speed", "True");
        if (SimVar.GetSimVarValue("AUTOPILOT MACH HOLD", "Boolean") || SimVar.GetSimVarValue("AUTOPILOT MANAGED SPEED IN MACH", "Boolean")) {
            let refMach = SimVar.GetSimVarValue("AUTOPILOT MACH HOLD VAR", "mach");
            this.airspeedElement.setAttribute("ref-speed", "M" + (refMach < 1 ? refMach.toFixed(2).slice(1) : refMach.toFixed(2)));
        } else {
            let refSpeed = SimVar.GetSimVarValue("AUTOPILOT AIRSPEED HOLD VAR", "knots");
            this.airspeedElement.setAttribute("ref-speed", Math.round(parseFloat(refSpeed)).toString());
        }
        if (this.acceleration == NaN) {
            this.acceleration = 0;
        }
        if (this.lastSpeed == null) {
            this.lastSpeed = indicatedSpeed;
        }
        let instantAcceleration;
        if (indicatedSpeed < 20) {
            instantAcceleration = 0;
            this.acceleration = 0;
        }
        else {
            instantAcceleration = (indicatedSpeed - this.lastSpeed) / (_deltaTime / 1000);
        }
        let smoothFactor = 2000;
        this.acceleration = ((Math.max((smoothFactor - _deltaTime), 0) * this.acceleration) + (Math.min(_deltaTime, smoothFactor) * instantAcceleration)) / smoothFactor;
        this.lastSpeed = indicatedSpeed;
        this.airspeedElement.setAttribute("airspeed-trend", (this.acceleration).toString());
        let crossSpeed = SimVar.GetGameVarValue("AIRCRAFT CROSSOVER SPEED", "Knots");
        let cruiseMach = SimVar.GetSimVarValue("MACH MAX OPERATE", "mach");
        let crossSpeedFactor = Simplane.getCrossoverSpeedFactor(this.maxSpeed, cruiseMach);
        if (crossSpeed != 0) {
            this.airspeedElement.setAttribute("max-speed", (Math.min(crossSpeedFactor, 1) * this.maxSpeed).toString());
        }
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
class HUD_Altimeter extends NavSystemElement {
    constructor() {
        super(...arguments);
        this.lastAltitude = -10000;
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
        let cdiSource = SimVar.GetSimVarValue("GPS DRIVES NAV1", "Bool") ? 3 : SimVar.GetSimVarValue("AUTOPILOT NAV SELECTED", "Number");
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
                if (this.gps.currFlightPlanManager.isActiveApproach() && Simplane.getAutoPilotApproachType() == 10) {
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
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
class HUD_Compass extends NavSystemElement {
    constructor(_hsiElemId = null, _arcHsiElemId = null) {
        super();
        this.hasLocBeenEntered = false;
        this.hasLocBeenActivated = false;
        this.ifTimer = 0;
        this.hsiElemId = _hsiElemId;
        this.arcHsiElemId = _arcHsiElemId;
    }
    init(root) {
        this.hsi = this.gps.getChildById(this.hsiElemId ? this.hsiElemId : "Compass");
        this.arcHsi = this.gps.getChildById(this.arcHsiElemId ? this.arcHsiElemId : "ArcCompass");
        this.nearestAirport = new NearestAirportList(this.gps);
    }
    onEnter() {
        if (this.hsi) {
            this.hsi.init();
        }
    }
    onUpdate(_deltaTime) {
        //Avionics.Utils.diffAndSetAttribute(this.hsi, "state", "Active");
        this.hsi.setAttribute("state", "Active");
        //Avionics.Utils.diffAndSetAttribute(this.arcHsi, "state", "Inactive");
        this.hsi.setAttribute("state", "Inactive");
        this.hsi.update(_deltaTime);
        this.nearestAirport.Update(25, 200);
        if (this.nearestAirport.airports.length == 0) {
            SimVar.SetSimVarValue("L:GPS_Current_Phase", "number", 4);
        }
        else {
            SimVar.SetSimVarValue("L:GPS_Current_Phase", "number", 3);
        }
        if (this.ifTimer <= 0) {
            this.ifTimer = 2000;
            if (this.gps.currFlightPlanManager.isActiveApproach()) {
                this.gps.currFlightPlanManager.getApproachIfIcao((value) => {
                    this.ifIcao = value;
                });
            }
        }
        else {
            this.ifTimer -= this.gps.deltaTime;
        }
        if (this.gps.currFlightPlanManager.isActiveApproach() && this.gps.currFlightPlanManager.getActiveWaypointIndex() != -1 && Simplane.getAutoPilotApproachType() == 4) {
            let approachWPNb = this.gps.currFlightPlanManager.getApproachWaypoints().length;
            let activeWP = this.gps.currFlightPlanManager.getActiveWaypoint();
            if (((this.ifIcao && this.ifIcao != "" && activeWP && this.ifIcao == activeWP.icao) || (approachWPNb > 0 && this.gps.currFlightPlanManager.getActiveWaypointIndex() >= approachWPNb - 2)) && !this.hasLocBeenEntered) {
                let approachFrequency = this.gps.currFlightPlanManager.getApproachNavFrequency();
                if (!isNaN(approachFrequency)) {
                    SimVar.SetSimVarValue("K:NAV1_RADIO_SWAP", "number", 0);
                    SimVar.SetSimVarValue("K:NAV1_RADIO_SET_HZ", "hertz", approachFrequency * 1000000);
                }
                this.hasLocBeenEntered = true;
            }
            else {
                let approachWP;
                let wpIndex = this.gps.currFlightPlanManager.getActiveWaypointIndex() - 1;
                if (wpIndex >= 0 && wpIndex < approachWPNb) {
                    approachWP = this.gps.currFlightPlanManager.getApproachWaypoints()[wpIndex];
                }
                if (((this.ifIcao && this.ifIcao != "" && approachWP && this.ifIcao == approachWP.icao && this.hasLocBeenEntered) || (approachWPNb > 0 && this.gps.currFlightPlanManager.getActiveWaypointIndex() == approachWPNb - 1)) && !this.hasLocBeenActivated) {
                    if (SimVar.GetSimVarValue("GPS DRIVES NAV1", "boolean")) {
                        SimVar.SetSimVarValue("K:TOGGLE_GPS_DRIVES_NAV1", "number", 0);
                    }
                    SimVar.SetSimVarValue("K:AP_NAV_SELECT_SET", "number", 1);
                    this.hasLocBeenActivated = true;
                }
            }
        }
        else {
            this.hasLocBeenEntered = false;
            this.hasLocBeenActivated = false;
        }
    }
    onExit() {
    }
    get cdiSource() {
        if (this.hsi)
            return this.hsi.logic_cdiSource;
        return 0;
    }
    set cdiSource(_val) {
        if (this.hsi)
            this.hsi.logic_cdiSource = _val;
    }
    get dmeSource() {
        return SimVar.GetSimVarValue("L:Glasscockpit_DmeSource", "Number");
    }
    set dmeSource(_val) {
        SimVar.SetSimVarValue("L:Glasscockpit_DmeSource", "Number", _val);
    }
    onEvent(_event) {
        this.hsi.onEvent(_event);
    }
}
registerInstrument("hud-element", HUD);
