class HudAttitudeIndicator extends HTMLElement {
    constructor() {
        super();
        //this.bankSizeRatio = -12.5;
        this.bankSizeRatio = -20;
        this.backgroundVisible = true;
        this.flightDirectorActive = false;
        this.flightDirectorPitch = 0;
        this.flightDirectorBank = 0;
        this.aspectRatio = 1.0;
        this.isBackup = false;
        this.horizonTopColor = "#00569d";
        this.horizonBottomColor = "#48432e";
        this.gearDown = true;
    }
    static get observedAttributes() {
        return [
            "pitch",
            "bank",
            "slip_skid",
            "aoa",
            "background",
            "flight_director-active",
            "flight_director-pitch",
            "flight_director-bank",
            "bank_size_ratio",
            "aspect-ratio",
            "is-backup",
            "gear-down",
        ];
    }
    connectedCallback() {
        this.construct();
    }
    buildGraduations() {
        if (!this.attitude_pitch)
            return;
        this.attitude_pitch.innerHTML = "";
        let maxDash = 80;
        let fullPrecisionLowerLimit = -20;
        let fullPrecisionUpperLimit = 20;
        let halfPrecisionLowerLimit = -30;
        let halfPrecisionUpperLimit = 45;
        let unusualAttitudeLowerLimit = -30;
        let unusualAttitudeUpperLimit = 50;
        let bigWidth = 120;
        let bigHeight = 1;
        let mediumWidth = 120;
        let mediumHeight = 1;
        let smallWidth = 60;
        let smallHeight = 0;
        let zeroWidth = 1000;
        let zeroHeight = 2;
        let fontSize = 14;
        let angle = -maxDash;
        let nextAngle;
        let width;
        let height;
        let text;
        let horizonBar = false;
        while (angle <= maxDash) {
            if (angle == 0) {
                horizonBar = true;
                width = zeroWidth;
                height = zeroHeight;
                text = false;
                nextAngle = angle + 2.5;
            }
            else if (angle % 10 == 0) {
                horizonBar = false;
                width = bigWidth;
                height = bigHeight;
                text = true;
                if (angle >= fullPrecisionLowerLimit && angle < fullPrecisionUpperLimit) {
                    nextAngle = angle + 2.5;
                }
                else if (angle >= halfPrecisionLowerLimit && angle < halfPrecisionUpperLimit) {
                    nextAngle = angle + 5;
                }
                else {
                    nextAngle = angle + 10;
                }
            }
            else {
                horizonBar = false;
                if (angle % 5 == 0) {
                    width = mediumWidth;
                    height = mediumHeight;
                    text = true;
                    if (angle >= fullPrecisionLowerLimit && angle < fullPrecisionUpperLimit) {
                        nextAngle = angle + 2.5;
                    }
                    else {
                        nextAngle = angle + 5;
                    }
                }
                else {
                    width = smallWidth;
                    height = smallHeight;
                    nextAngle = angle + 2.5;
                    text = false;
                }
            }
            let barWidth = 5/8;
            if(horizonBar == true){
                let rect = document.createElementNS(Avionics.SVG.NS, "rect");
                rect.setAttribute("fill", "#00ff00");
                rect.setAttribute("x", (-width / 2).toString());
                rect.setAttribute("y", (this.bankSizeRatio * angle - height / 2).toString());
                rect.setAttribute("width", width.toString());
                rect.setAttribute("height", height.toString());
                this.attitude_pitch.appendChild(rect);
            } else {
                let leftRect = document.createElementNS(Avionics.SVG.NS, "rect");
                leftRect.setAttribute("fill", "#00ff00");
                leftRect.setAttribute("x", (-width / 2).toString());
                leftRect.setAttribute("y", (this.bankSizeRatio * angle - height / 2).toString());
                leftRect.setAttribute("width", (width/2 * (barWidth)).toString());
                leftRect.setAttribute("height", height.toString());
                this.attitude_pitch.appendChild(leftRect);
                let rightRect = document.createElementNS(Avionics.SVG.NS, "rect");
                rightRect.setAttribute("fill", "#00ff00");
                rightRect.setAttribute("x", ((width/2) * (1 - barWidth)).toString());
                rightRect.setAttribute("y", (this.bankSizeRatio * angle - height / 2).toString());
                rightRect.setAttribute("width", (width/2 * (barWidth)).toString());
                rightRect.setAttribute("height", height.toString());
                this.attitude_pitch.appendChild(rightRect);
            }
            if (text) {
                let vertLeftLine = document.createElementNS(Avionics.SVG.NS, "rect");
                vertLeftLine.setAttribute("fill", "#00ff00");
                vertLeftLine.setAttribute("x", (-width / 2).toString());
                vertLeftLine.setAttribute("y", (this.bankSizeRatio * angle - height / 2).toString());
                vertLeftLine.setAttribute("width", "1");
                vertLeftLine.setAttribute("height", "6");
                this.attitude_pitch.appendChild(vertLeftLine);
                let vertRightLine = document.createElementNS(Avionics.SVG.NS, "rect");
                vertRightLine.setAttribute("fill", "#00ff00");
                vertRightLine.setAttribute("x", (width / 2).toString());
                vertRightLine.setAttribute("y", (this.bankSizeRatio * angle - height / 2).toString());
                vertRightLine.setAttribute("width", "1");
                vertRightLine.setAttribute("height", "6");
                this.attitude_pitch.appendChild(vertRightLine);
                let leftText = document.createElementNS(Avionics.SVG.NS, "text");
                leftText.textContent = Math.abs(angle).toString();
                leftText.setAttribute("x", ((-width / 2) - 1).toString());
                leftText.setAttribute("y", (this.bankSizeRatio * angle - height / 2 + (fontSize / 2)-1).toString());
                leftText.setAttribute("text-anchor", "end");
                leftText.setAttribute("font-size", fontSize.toString());
                leftText.setAttribute("font-family", "Roboto");
                leftText.setAttribute("fill", "#00ff00");
                this.attitude_pitch.appendChild(leftText);
                let rightText = document.createElementNS(Avionics.SVG.NS, "text");
                rightText.textContent = Math.abs(angle).toString();
                rightText.setAttribute("x", ((width / 2) + 1).toString());
                rightText.setAttribute("y", (this.bankSizeRatio * angle - height / 2 + fontSize / 2).toString());
                rightText.setAttribute("text-anchor", "start");
                rightText.setAttribute("font-size", fontSize.toString());
                rightText.setAttribute("font-family", "Roboto");
                rightText.setAttribute("fill", "#00ff00");
                this.attitude_pitch.appendChild(rightText);
            }
            if (angle < unusualAttitudeLowerLimit) {
                let chevron = document.createElementNS(Avionics.SVG.NS, "path");
                let path = "M" + -smallWidth / 2 + " " + (this.bankSizeRatio * nextAngle - bigHeight / 2) + " l" + smallWidth + "  0 ";
                path += "L" + bigWidth / 2 + " " + (this.bankSizeRatio * angle - bigHeight / 2) + " l" + -smallWidth + " 0 ";
                path += "L0 " + (this.bankSizeRatio * nextAngle + 20) + " ";
                path += "L" + (-bigWidth / 2 + smallWidth) + " " + (this.bankSizeRatio * angle - bigHeight / 2) + " l" + -smallWidth + " 0 Z";
                chevron.setAttribute("d", path);
                chevron.setAttribute("fill", "#00ff00");
                this.attitude_pitch.appendChild(chevron);
            }
            if (angle >= unusualAttitudeUpperLimit && nextAngle <= maxDash) {
                let chevron = document.createElementNS(Avionics.SVG.NS, "path");
                let path = "M" + -smallWidth / 2 + " " + (this.bankSizeRatio * angle - bigHeight / 2) + " l" + smallWidth + "  0 ";
                path += "L" + (bigWidth / 2) + " " + (this.bankSizeRatio * nextAngle + bigHeight / 2) + " l" + -smallWidth + " 0 ";
                path += "L0 " + (this.bankSizeRatio * angle - 20) + " ";
                path += "L" + (-bigWidth / 2 + smallWidth) + " " + (this.bankSizeRatio * nextAngle + bigHeight / 2) + " l" + -smallWidth + " 0 Z";
                chevron.setAttribute("d", path);
                chevron.setAttribute("fill", "#00ff00");
                this.attitude_pitch.appendChild(chevron);
            }
            angle = nextAngle;
        }
    }
    construct() {
        Utils.RemoveAllChildren(this);
        /*
        let attitudeContainer = document.createElement("div");
        attitudeContainer.setAttribute("id", "Attitude");
        attitudeContainer.style.width = "100%";
        attitudeContainer.style.height = "100%";
        attitudeContainer.style.position = "absolute";
        this.appendChild(attitudeContainer);
        */
        this.root = document.createElementNS(Avionics.SVG.NS, "svg");
        this.root.setAttribute("width", "100%");
        this.root.setAttribute("height", "100%");
        this.root.setAttribute("viewBox", "-100 -225 200 350");
        this.root.setAttribute("overflow", "visible");
        //attitudeContainer.appendChild(this.root);
        this.appendChild(this.root);
        var refHeight = 225;
        let attitude_pitch_container = document.createElementNS(Avionics.SVG.NS, "svg");
        attitude_pitch_container.setAttribute("width", "250");
        attitude_pitch_container.setAttribute("height", refHeight.toString());
        attitude_pitch_container.setAttribute("x", "-125");
        attitude_pitch_container.setAttribute("y", "-60");
        attitude_pitch_container.setAttribute("viewBox", "-125 -60 250 " + refHeight.toString());
        attitude_pitch_container.setAttribute("overflow", "hidden");
        this.root.appendChild(attitude_pitch_container);
        this.attitude_pitch = document.createElementNS(Avionics.SVG.NS, "g");
        attitude_pitch_container.appendChild(this.attitude_pitch);
        this.buildGraduations();
        this.flightDirector = document.createElementNS(Avionics.SVG.NS, "g");
        attitude_pitch_container.appendChild(this.flightDirector);
        let fdCursor = document.createElementNS(Avionics.SVG.NS, "path");
        fdCursor.setAttribute("d", "M 0 -2 l 8 -5 h 12 v 2 h -12 l -8 5 l -8 -5 h -12 v -2 h 12 Z");
        fdCursor.setAttribute("fill", "#00ff00");
        this.flightDirector.appendChild(fdCursor);
        {
            let attitude_bank_container = document.createElementNS(Avionics.SVG.NS, "svg");
            attitude_bank_container.setAttribute("width", "230");
            attitude_bank_container.setAttribute("height", "230");
            attitude_bank_container.setAttribute("x", "-115");
            attitude_bank_container.setAttribute("y", "-120");
            attitude_bank_container.setAttribute("viewBox", "-100 -120 200 306");
            this.root.appendChild(attitude_bank_container);

            let clippath = document.createElementNS(Avionics.SVG.NS, "clipPath");
            clippath.setAttributeNS(null, "id", "clip");
            attitude_bank_container.appendChild(clippath);

            let cliprect = document.createElementNS(Avionics.SVG.NS, "rect");
            cliprect.setAttribute("x", "-60");
            cliprect.setAttribute("y", "-115");
            cliprect.setAttribute("width", "120");
            cliprect.setAttribute("height", "50");
            clippath.appendChild(cliprect);
            attitude_bank_container.setAttribute("clip-path", "url(#clip)");

            this.attitude_bank = document.createElementNS(Avionics.SVG.NS, "g");
            attitude_bank_container.appendChild(this.attitude_bank);
            let topTriangle = document.createElementNS(Avionics.SVG.NS, "path");
            topTriangle.setAttribute("d", "M0 -91 l-4 -6 l8 0 Z");
            topTriangle.setAttribute("stroke", "#00ff00");
            topTriangle.setAttribute("stroke-width", "1");
            this.attitude_bank.appendChild(topTriangle);

            let bottomTriangle = document.createElementNS(Avionics.SVG.NS, "path");
            bottomTriangle.setAttribute("d", "M 0 -90 l -4 6 l 8 0 Z");
            bottomTriangle.setAttribute("stroke", "#00ff00");
            bottomTriangle.setAttribute("stroke-width", "1");
            attitude_bank_container.appendChild(bottomTriangle);
            let bigDashes = [-60, -30, 30, 60];
            let smallDashes = [-45, -20, -10, 10, 20, 45];
            let radius = 90;
            let width = 2;
            let height = 12;
            for (let i = 0; i < bigDashes.length; i++) {
                let dash = document.createElementNS(Avionics.SVG.NS, "rect");
                dash.setAttribute("x", (-width / 2).toString());
                dash.setAttribute("y", (-radius - height).toString());
                dash.setAttribute("height", height.toString());
                dash.setAttribute("width", width.toString());
                dash.setAttribute("stroke", "#00ff00");
                dash.setAttribute("stroke-width", "2");
                dash.setAttribute("transform", "rotate(" + bigDashes[i] + ",0,0)");
                this.attitude_bank.appendChild(dash);
            }
            width = 2;
            height = 6;
            for (let i = 0; i < smallDashes.length; i++) {
                let dash = document.createElementNS(Avionics.SVG.NS, "rect");
                dash.setAttribute("x", (-width / 2).toString());
                dash.setAttribute("y", (-radius - height).toString());
                dash.setAttribute("height", height.toString());
                dash.setAttribute("width", width.toString());
                dash.setAttribute("fill", "#00ff00");
                dash.setAttribute("transform", "rotate(" + smallDashes[i] + ",0,0)");
                this.attitude_bank.appendChild(dash);
            }
        }
        {

            this.movableCursor = document.createElementNS(Avionics.SVG.NS, "g");
            this.root.appendChild(this.movableCursor);

            this.cursorCircle = document.createElementNS(Avionics.SVG.NS, "path");
            this.cursorCircle.setAttribute("d", "M -0 -10 A 10 10 0 1 1 -1 -10 Z");
            this.cursorCircle.setAttribute("fill", "none");
            this.cursorCircle.setAttribute("stroke", "#00ff00");
            this.cursorCircle.setAttribute("stroke-width", "2");
            this.movableCursor.appendChild(this.cursorCircle);
            let cursorLines = [-90, 0, 90];
            let radius = 10;
            let width = 1;
            let height = 15;
            for(let i = 0; i < cursorLines.length; i++){
                let dash = document.createElementNS(Avionics.SVG.NS, "rect");
                dash.setAttribute("x", (-width / 2).toString());
                dash.setAttribute("y", (-radius - height).toString());
                dash.setAttribute("height", height.toString());
                dash.setAttribute("width", width.toString());
                dash.setAttribute("fill", "#00ff00");
                dash.setAttribute("transform", "rotate(" + cursorLines[i] + ",0,0)");
                this.movableCursor.appendChild(dash);
            }
            this.aoaDevTape = document.createElementNS(Avionics.SVG.NS, "rect");
            this.aoaDevTape.setAttribute("x", (-radius - (height / 2)).toString());
            this.aoaDevTape.setAttribute("y", (-1).toString());
            this.aoaDevTape.setAttribute("height", "1");
            this.aoaDevTape.setAttribute("width", "2");
            this.aoaDevTape.setAttribute("fill", "#00ff00");
            this.movableCursor.appendChild(this.aoaDevTape)

            let cursors = document.createElementNS(Avionics.SVG.NS, "g");
            this.root.appendChild(cursors);
            let centerCursor = document.createElementNS(Avionics.SVG.NS, "path");
            centerCursor.setAttribute("d", "M 0 0 l 8 -5 h 12 v 2 h -12 l -8 5 l -8 -5 h -12 v -2 h 12 Z");
            centerCursor.setAttribute("stroke", "#00ff00");
            centerCursor.setAttribute("stroke-width", "1");
            cursors.appendChild(centerCursor);
        }
        this.applyAttributes();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue == newValue)
            return;
        switch (name) {
            case "is-backup":
                this.isBackup = newValue == "true";
                break;
            case "aspect-ratio":
                this.aspectRatio = parseFloat(newValue);
                this.construct();
                break;
            case "pitch":
                this.pitch = parseFloat(newValue);
                break;
            case "bank":
                this.bank = parseFloat(newValue);
                break;
            case "slip_skid":
                this.slipSkidValue = parseFloat(newValue);
                break;
            case "aoa":
                this.aoa = parseFloat(newValue);
                break;
            case "background":
                if (newValue == "false")
                    this.backgroundVisible = false;
                else
                    this.backgroundVisible = true;
                break;
            case "flight_director-active":
                this.flightDirectorActive = newValue == "true";
                break;
            case "flight_director-pitch":
                this.flightDirectorPitch = parseFloat(newValue);
                break;
            case "flight_director-bank":
                this.flightDirectorBank = parseFloat(newValue);
                break;
            case "bank_size_ratio":
                this.bankSizeRatio = parseFloat(newValue);
                this.buildGraduations();
                break;
            case "gear-down":
                this.gearDown = newValue == "true";
                break;
            default:
                return;
        }
        this.applyAttributes();
    }
    applyAttributes() {
        if (this.bottomPart)
            this.bottomPart.setAttribute("transform", "rotate(" + this.bank + ", 0, 0) translate(0," + (this.pitch * this.bankSizeRatio) + ")");
        if (this.attitude_pitch)
            this.attitude_pitch.setAttribute("transform", "rotate(" + this.bank + ", 0, 0) translate(0," + (this.pitch * this.bankSizeRatio) + ")");
        if (this.attitude_bank)
            this.attitude_bank.setAttribute("transform", "rotate(" + this.bank + ", 0, 0)");
        if (this.aoa){
            this.movableCursor.setAttribute("transform", "translate(" + ((this.slipSkidValue / Math.PI * 180) * (-this.bankSizeRatio)) + " " + (-1.0 * (this.aoa / Math.PI * 180) * this.bankSizeRatio) + ")");
        }
        if (this.horizonTop) {
            if (this.backgroundVisible) {
                this.horizonTop.setAttribute("fill", this.horizonTopColor);
                this.horizonBottom.setAttribute("fill", this.horizonBottomColor);
            }
            else {
                this.horizonTop.setAttribute("fill", "transparent");
                this.horizonBottom.setAttribute("fill", "transparent");
            }
        }
        if (this.flightDirector) {
            if (this.flightDirectorActive) {
                this.flightDirector.setAttribute("transform", "rotate(" + (this.bank - this.flightDirectorBank) + ") translate(0 " + ((this.pitch - this.flightDirectorPitch) * this.bankSizeRatio) + ")");
                this.flightDirector.setAttribute("display", "");
            }
            else {
                this.flightDirector.setAttribute("display", "none");
            }
        }
        if (this.aoaDevTape) {
            if (this.gearDown){
                let tapeLength = (-1.0 * (this.aoa / Math.PI * 180)) + 8.0;
                this.aoaDevTape.setAttribute("transform", "scale(1, " + tapeLength + ")");
            }
            else {
                this.aoaDevTape.setAttribute("transform", "scale(1, 0)");
            }
        }
    }
}
customElements.define('glasscockpit-hud-attitude-indicator', HudAttitudeIndicator);
//# sourceMappingURL=AttitudeIndicator.js.map