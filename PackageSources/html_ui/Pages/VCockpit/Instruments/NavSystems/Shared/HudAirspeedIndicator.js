class ReferenceBug {
}
class HudAirspeedIndicator extends HTMLElement {
    constructor() {
        super();
        this.trendValue = 0;
        this.redBegin = 0;
        this.redEnd = 0;
        this.greenBegin = 0;
        this.greenEnd = 0;
        this.flapsBegin = 0;
        this.flapsEnd = 0;
        this.yellowBegin = 0;
        this.yellowEnd = 0;
        this.minValue = 0;
        this.maxValue = 0;
        this.currentCenterGrad = 0;
        this.referenceBugs = [];
        this.nocolor = false;
    }
    static get observedAttributes() {
        return [
            "airspeed",
            "airspeed-trend",
            "min-speed",
            "green-begin",
            "green-end",
            "flaps-begin",
            "flaps-end",
            "yellow-begin",
            "yellow-end",
            "red-begin",
            "red-end",
            "max-speed",
            "mach-airspeed",
            "reference-bugs",
            "display-ref-speed",
            "ref-speed"
        ];
    }
    connectedCallback() {
        this.root = document.createElementNS(Avionics.SVG.NS, "svg");
        this.root.setAttribute("width", "100%");
        this.root.setAttribute("height", "100%");
        this.root.setAttribute("viewBox", "0 -50 250 700");
        this.appendChild(this.root);
        {
            this.airspeedReferenceGroup = document.createElementNS(Avionics.SVG.NS, "g");
            this.root.appendChild(this.airspeedReferenceGroup);
            let background = document.createElementNS(Avionics.SVG.NS, "rect");
            background.setAttribute("x", "0");
            background.setAttribute("y", "-50");
            background.setAttribute("width", "200");
            background.setAttribute("height", "50");
            background.setAttribute("fill", "#000000");
            background.setAttribute("fill-opacity", "1");
            this.airspeedReferenceGroup.appendChild(background);
            /*
            this.selectedSpeedFixedBug = document.createElementNS(Avionics.SVG.NS, "polygon");
            this.selectedSpeedFixedBug.setAttribute("points", "190,-40 180,-40 180,-30 185,-25 180,-20 180,-10 190,-10 ");
            this.selectedSpeedFixedBug.setAttribute("fill", "#00ff00");
            this.airspeedReferenceGroup.appendChild(this.selectedSpeedFixedBug);
            */
            this.selectedSpeedText = document.createElementNS(Avionics.SVG.NS, "text");
            this.selectedSpeedText.setAttribute("x", "190");
            this.selectedSpeedText.setAttribute("y", "-10");
            this.selectedSpeedText.setAttribute("fill", "#00ff00");
            this.selectedSpeedText.setAttribute("font-size", "45");
            this.selectedSpeedText.setAttribute("font-family", "Roboto");
            this.selectedSpeedText.setAttribute("text-anchor", "end");
            this.selectedSpeedText.textContent = "---";
            this.airspeedReferenceGroup.appendChild(this.selectedSpeedText);
        }
        {
            let background = document.createElementNS(Avionics.SVG.NS, "rect");
            background.setAttribute("x", "0");
            background.setAttribute("y", "0");
            background.setAttribute("width", "200");
            background.setAttribute("height", "600");
            //background.setAttribute("stroke", "#00ff00");
            //background.setAttribute("stroke-width", "5");
            background.setAttribute("fill", "#000000");
            background.setAttribute("fill-opacity", "1");
            this.root.appendChild(background);
            let backgroundLine = document.createElementNS(Avionics.SVG.NS, "path");
            backgroundLine.setAttribute("d", "M 0 -5 l 200 0 l 0 605 l -200 0");
            backgroundLine.setAttribute("fill", "transparent");
            backgroundLine.setAttribute("stroke", "#00ff00");
            backgroundLine.setAttribute("stroke-width", "5");
            this.root.appendChild(backgroundLine);
            this.centerSvg = document.createElementNS(Avionics.SVG.NS, "svg");
            this.centerSvg.setAttribute("x", "0");
            this.centerSvg.setAttribute("y", "0");
            this.centerSvg.setAttribute("width", "250");
            this.centerSvg.setAttribute("height", "600");
            this.centerSvg.setAttribute("viewBox", "0 0 250 600");
            this.root.appendChild(this.centerSvg);
            {
                this.centerGroup = document.createElementNS(Avionics.SVG.NS, "g");
                this.centerSvg.appendChild(this.centerGroup);
                {
                    this.gradTexts = [];
                    if (this.getAttribute("NoColor") != "True") {
                        this.redElement = document.createElementNS(Avionics.SVG.NS, "rect");
                        this.redElement.setAttribute("x", "175");
                        this.redElement.setAttribute("y", "-1");
                        this.redElement.setAttribute("width", "25");
                        this.redElement.setAttribute("height", "0");
                        this.redElement.setAttribute("fill", "#00ff00");
                        this.centerGroup.appendChild(this.redElement);
                        this.yellowElement = document.createElementNS(Avionics.SVG.NS, "rect");
                        this.yellowElement.setAttribute("x", "190");
                        this.yellowElement.setAttribute("y", "-1");
                        this.yellowElement.setAttribute("width", "10");
                        this.yellowElement.setAttribute("height", "0");
                        this.yellowElement.setAttribute("fill", "#00ff00");
                        this.centerGroup.appendChild(this.yellowElement);
                        this.greenElement = document.createElementNS(Avionics.SVG.NS, "rect");
                        this.greenElement.setAttribute("x", "193.75");
                        this.greenElement.setAttribute("y", "-1");
                        this.greenElement.setAttribute("width", "0");
                        this.greenElement.setAttribute("height", "0");
                        this.greenElement.setAttribute("fill", "#00ef00");
                        this.centerGroup.appendChild(this.greenElement);
                        this.flapsElement = document.createElementNS(Avionics.SVG.NS, "rect");
                        this.flapsElement.setAttribute("x", "193.75");
                        this.flapsElement.setAttribute("y", "-1");
                        this.flapsElement.setAttribute("width", "0");
                        this.flapsElement.setAttribute("height", "0");
                        this.flapsElement.setAttribute("fill", "#00ff00");
                        this.centerGroup.appendChild(this.flapsElement);
                        let dashSvg = document.createElementNS(Avionics.SVG.NS, "svg");
                        dashSvg.setAttribute("id", "DASH");
                        dashSvg.setAttribute("x", "175");
                        dashSvg.setAttribute("y", "0");
                        dashSvg.setAttribute("width", "25");
                        dashSvg.setAttribute("height", "600");
                        dashSvg.setAttribute("viewBox", "0 0 25 600");
                        this.root.appendChild(dashSvg);
                        this.startElement = document.createElementNS(Avionics.SVG.NS, "g");
                        dashSvg.appendChild(this.startElement);
                        let startBg = document.createElementNS(Avionics.SVG.NS, "rect");
                        startBg.setAttribute("x", "0");
                        startBg.setAttribute("y", "-935");
                        startBg.setAttribute("width", "25");
                        startBg.setAttribute("height", "800");
                        startBg.setAttribute("fill", "#000000");
                        this.startElement.appendChild(startBg);
                        for (let i = 0; i <= 32; i++) {
                            let redLine = document.createElementNS(Avionics.SVG.NS, "rect");
                            redLine.setAttribute("x", "0");
                            redLine.setAttribute("y", (-130 - 20 * i).toString());
                            redLine.setAttribute("width", "20");
                            redLine.setAttribute("height", "10");
                            redLine.setAttribute("transform", "skewY(-30)");
                            redLine.setAttribute("fill", "#00ff00");
                            this.startElement.appendChild(redLine);
                        }
                        this.endElement = document.createElementNS(Avionics.SVG.NS, "g");
                        dashSvg.appendChild(this.endElement);
                        let endBg = document.createElementNS(Avionics.SVG.NS, "rect");
                        endBg.setAttribute("x", "0");
                        endBg.setAttribute("y", "-900");
                        endBg.setAttribute("width", "25");
                        endBg.setAttribute("height", "800");
                        endBg.setAttribute("fill", "#000000");
                        this.endElement.appendChild(endBg);
                        for (let i = 0; i <= 32; i++) {
                            let redLine = document.createElementNS(Avionics.SVG.NS, "rect");
                            redLine.setAttribute("x", "0");
                            redLine.setAttribute("y", (-125 - 25 * i).toString());
                            redLine.setAttribute("width", "25");
                            redLine.setAttribute("height", "12.5");
                            redLine.setAttribute("transform", "skewY(-30)");
                            redLine.setAttribute("fill", "#00ff00");
                            this.endElement.appendChild(redLine);
                        }
                    }
                    else {
                        this.nocolor = true;
                    }
                    let AScenter = 298;
                    for (let i = -4; i <= 4; i++) {
                        let grad = document.createElementNS(Avionics.SVG.NS, "rect");
                        grad.setAttribute("x", "180");
                        grad.setAttribute("y", (AScenter + 100 * i).toString());
                        grad.setAttribute("height", "4");
                        grad.setAttribute("width", "20");
                        grad.setAttribute("fill", "#00ff00");
                        this.centerGroup.appendChild(grad);
                        if (i != 0) {
                            let halfGrad = document.createElementNS(Avionics.SVG.NS, "rect");
                            halfGrad.setAttribute("x", "180");
                            halfGrad.setAttribute("y", (AScenter + 100 * i + (i < 0 ? 50 : -50)).toString());
                            halfGrad.setAttribute("height", "4");
                            halfGrad.setAttribute("width", "20");
                            halfGrad.setAttribute("fill", "#00ff00");
                            this.centerGroup.appendChild(halfGrad);
                        }
                        let gradText = document.createElementNS(Avionics.SVG.NS, "text");
                        gradText.setAttribute("x", "175");
                        gradText.setAttribute("y", (315 + 100 * i).toString());
                        gradText.setAttribute("fill", "#00ff00");
                        gradText.setAttribute("font-size", "40");
                        gradText.setAttribute("text-anchor", "end");
                        gradText.setAttribute("font-family", "Roboto");
                        gradText.setAttribute("letter-spacing", "12");
                        gradText.textContent = "XXX";
                        this.gradTexts.push(gradText);
                        this.centerGroup.appendChild(gradText);
                    }
                    /*let center = 300;
                    this.selectedSpeedBug = document.createElementNS(Avionics.SVG.NS, "polygon");
                    this.selectedSpeedBug.setAttribute("points", "200, " + (center - 20) + " 180, " + (center - 20) + " 180, " + (center - 15) + " 190, " + center + " 180, " + (center + 15) + " 180, " + (center + 20) + " 200, " + (center + 20));
                    //this.selectedSpeedBug.setAttribute("fill", "#36c8d2");
                    //this.selectedSpeedBug.setAttribute("stroke", "#00ff00");
                    //this.selectedSpeedBug.setAttribute("stroke-width", "1");
                    this.centerSvg.appendChild(this.selectedSpeedBug);*/
                }
                let cursor = document.createElementNS(Avionics.SVG.NS, "path");
                cursor.setAttribute("d", "M 180 300 L 160 270 L 150 270 L 150 240 L 100 240 L 100 270 L 0 270 L 0 330 L 100 330 L 100 360 L 150 360 L 150 330 L 160 330 Z");
                cursor.setAttribute("stroke", "#00ff00");
                cursor.setAttribute("stroke-width", "2");
                cursor.setAttribute("fill", "#000000");
                this.root.appendChild(cursor);
                this.trendElement = document.createElementNS(Avionics.SVG.NS, "rect");
                this.trendElement.setAttribute("x", "180");
                this.trendElement.setAttribute("y", "-1");
                this.trendElement.setAttribute("width", "5");
                this.trendElement.setAttribute("height", "0");
                this.trendElement.setAttribute("fill", "#00ff00");
                this.root.appendChild(this.trendElement);
                {
                    this.trendCursor = document.createElementNS(Avionics.SVG.NS, "path");
                    this.trendCursor.setAttribute("d", "M 180 0 l 10 -10 l 30 0 l 0 20 l -30 0 Z");
                    //this.trendCursor.setAttribute("x", "210");
                    //this.trendCursor.setAttribute("y", "265");
                    //this.trendCursor.setAttribute("height", "20");
                    //this.trendCursor.setAttribute("width", "60");
                    this.trendCursor.setAttribute("fill", "000100");
                    this.trendCursor.setAttribute("stroke", "#00ff00");
                    this.trendCursor.setAttribute("stroke-width", "4");
                    //this.trendCursor.setAttribute("fill", "#00ff00");
                    this.root.appendChild(this.trendCursor);
                }
                let baseCursorSvg = document.createElementNS(Avionics.SVG.NS, "svg");
                baseCursorSvg.setAttribute("x", "0");
                baseCursorSvg.setAttribute("y", "260");
                baseCursorSvg.setAttribute("width", "100");
                baseCursorSvg.setAttribute("height", "80");
                baseCursorSvg.setAttribute("viewBox", "0 0 100 80");
                this.root.appendChild(baseCursorSvg);
                {
                    this.digit1Top = document.createElementNS(Avionics.SVG.NS, "text");
                    this.digit1Top.setAttribute("x", "28");
                    this.digit1Top.setAttribute("y", "-1");
                    this.digit1Top.setAttribute("fill", "#00ff00");
                    this.digit1Top.setAttribute("font-size", "50");
                    this.digit1Top.setAttribute("font-family", "Roboto-Bold");
                    this.digit1Top.textContent = "-";
                    baseCursorSvg.appendChild(this.digit1Top);
                    this.digit1Bot = document.createElementNS(Avionics.SVG.NS, "text");
                    this.digit1Bot.setAttribute("x", "28");
                    this.digit1Bot.setAttribute("y", "55");
                    this.digit1Bot.setAttribute("fill", "#00ff00");
                    this.digit1Bot.setAttribute("font-size", "50");
                    this.digit1Bot.setAttribute("font-family", "Roboto-Bold");
                    this.digit1Bot.textContent = "-";
                    baseCursorSvg.appendChild(this.digit1Bot);
                    this.digit2Top = document.createElementNS(Avionics.SVG.NS, "text");
                    this.digit2Top.setAttribute("x", "70");
                    this.digit2Top.setAttribute("y", "-1");
                    this.digit2Top.setAttribute("fill", "#00ff00");
                    this.digit2Top.setAttribute("font-size", "50");
                    this.digit2Top.setAttribute("font-family", "Roboto-Bold");
                    this.digit2Top.textContent = "-";
                    baseCursorSvg.appendChild(this.digit2Top);
                    this.digit2Bot = document.createElementNS(Avionics.SVG.NS, "text");
                    this.digit2Bot.setAttribute("x", "70");
                    this.digit2Bot.setAttribute("y", "55");
                    this.digit2Bot.setAttribute("fill", "#00ff00");
                    this.digit2Bot.setAttribute("font-size", "50");
                    this.digit2Bot.setAttribute("font-family", "Roboto-Bold");
                    this.digit2Bot.textContent = "-";
                    baseCursorSvg.appendChild(this.digit2Bot);
                }
                let rotatingCursorSvg = document.createElementNS(Avionics.SVG.NS, "svg");
                rotatingCursorSvg.setAttribute("x", "100");
                rotatingCursorSvg.setAttribute("y", "240");
                rotatingCursorSvg.setAttribute("width", "70");
                rotatingCursorSvg.setAttribute("height", "120");
                rotatingCursorSvg.setAttribute("viewBox", "0 -60 50 120");
                this.root.appendChild(rotatingCursorSvg);
                {
                    this.endDigitsGroup = document.createElementNS(Avionics.SVG.NS, "g");
                    rotatingCursorSvg.appendChild(this.endDigitsGroup);
                    this.endDigits = [];
                    for (let i = -2; i <= 2; i++) {
                        let digit = document.createElementNS(Avionics.SVG.NS, "text");
                        digit.setAttribute("x", "0");
                        digit.setAttribute("y", (15 + 45 * i).toString());
                        digit.setAttribute("fill", "#00ff00");
                        digit.setAttribute("font-size", "50");
                        digit.setAttribute("font-family", "Roboto-Bold");
                        digit.textContent = i == 0 ? "-" : " ";
                        this.endDigits.push(digit);
                        this.endDigitsGroup.appendChild(digit);
                    }
                }
            }
        }
        {
            this.bottomBackground = document.createElementNS(Avionics.SVG.NS, "rect");
            this.bottomBackground.setAttribute("x", "0");
            this.bottomBackground.setAttribute("y", "600");
            this.bottomBackground.setAttribute("width", "200");
            this.bottomBackground.setAttribute("height", "50");
            this.bottomBackground.setAttribute("fill", "#000000");
            this.bottomBackground.setAttribute("fill-opacity", "0");
            this.root.appendChild(this.bottomBackground);
            
            this.maText = document.createElementNS(Avionics.SVG.NS, "text");
            this.maText.setAttribute("x", "165");
            this.maText.setAttribute("y", "638");
            this.maText.setAttribute("fill", "#00ff00");
            this.maText.setAttribute("font-size", "42");
            this.maText.setAttribute("font-family", "Roboto");
            this.maText.setAttribute("text-anchor", "end");
            this.maText.textContent = "0.000";
            this.root.appendChild(this.maText);
        }
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue == newValue && name != "airspeed")
            return;
        switch (name) {
            case "airspeed":
                this.value = Math.max(parseFloat(newValue), 20);
                let center = Math.max(Math.round(this.value / 20) * 20, 120);

                // Don't think I need these anyways, cursor and background filled in callback

                //Avionics.Utils.diffAndSetAttribute(this.cursor, "fill", "#000100");
                //this.cursor.setAttribute("fill", "#000100");
                //Avionics.Utils.diffAndSetAttribute(this.bottomBackground, "fill", "#000100");
                //this.bottomBackground.setAttribute("fill", "#000100");
                
                this.centerGroup.setAttribute("transform", "translate(0, " + ((this.value - center) * 5) + ")");
                if (!this.nocolor) {
                    if (this.minValue > 0) {
                        var val = 835 + ((center + 80 - this.minValue) * 5) + ((this.value - center) * 5);
                        this.startElement.setAttribute("transform", "translate(0," + val + ")");
                    }
                    if (this.maxValue > 0) {
                        var val = ((Math.min(Math.max(center + 80 - this.maxValue, -5), 160) * 5) + (this.value - center) * 5);
                        this.endElement.setAttribute("transform", "translate(0," + val + ")");
                    }
                }
                for (let i = 0; i < this.referenceBugs.length; i++) {
                    this.referenceBugs[i].group.setAttribute("transform", "translate(0," + ((this.value - this.referenceBugs[i].value) * 5) + ")");
                }
                if (this.currentCenterGrad != center) {
                    this.currentCenterGrad = center;
                    for (let i = 0; i < this.gradTexts.length; i++) {
                        this.gradTexts[i].textContent = fastToFixed(((4 - i) * 20) + center, 0);
                    }
                    if (!this.nocolor) {
                        let greenEnd = Math.min(Math.max(-100, (300 + (-5 * (this.greenEnd - center)))), 700);
                        let greenBegin = Math.min(Math.max(-100, (300 + (-5 * (this.greenBegin - center)))), 700);
                        this.greenElement.setAttribute("y", greenEnd.toString());
                        this.greenElement.setAttribute("height", (greenBegin - greenEnd).toString());
                        let yellowEnd = Math.min(Math.max(-100, (300 + (-5 * (this.yellowEnd - center)))), 700);
                        let yellowBegin = Math.min(Math.max(-100, (300 + (-5 * (this.yellowBegin - center)))), 700);
                        this.yellowElement.setAttribute("y", yellowEnd.toString());
                        this.yellowElement.setAttribute("height", (yellowBegin - yellowEnd).toString());
                        let redEnd = Math.min(Math.max(-100, (300 + (-5 * (this.redEnd - center)))), 700);
                        let redBegin = Math.min(Math.max(-100, (300 + (-5 * (this.redBegin - center)))), 700);
                        this.redElement.setAttribute("y", redEnd.toString());
                        this.redElement.setAttribute("height", (redBegin - redEnd).toString());
                        let flapsEnd = Math.min(Math.max(-100, (300 + (-5 * (this.flapsEnd - center)))), 700);
                        let flapsBegin = Math.min(Math.max(-100, (300 + (-5 * (this.flapsBegin - center)))), 700);
                        this.flapsElement.setAttribute("y", flapsEnd.toString());
                        this.flapsElement.setAttribute("height", (flapsBegin - flapsEnd).toString());
                    }
                }
                let endValue = this.value % 10;
                let endCenter = Math.round(endValue);
                this.endDigitsGroup.setAttribute("transform", "translate(0, " + ((endValue - endCenter) * 45) + ")");
                for (let i = 0; i < this.endDigits.length; i++) {
                    if (this.value == 20) {
                        this.endDigits[i].textContent = (i == 2 ? "-" : " ");
                    }
                    else {
                        let digitValue = (2 - i + endCenter);
                        this.endDigits[i].textContent = fastToFixed((10 + digitValue) % 10, 0);
                    }
                }
                if (this.value > 20) {
                    let d2Value = (Math.abs(this.value) % 100) / 10;
                    this.digit2Bot.textContent = fastToFixed(Math.floor(d2Value), 0);
                    this.digit2Top.textContent = fastToFixed((Math.floor(d2Value) + 1) % 10, 0);
                    if (endValue > 9) {
                        let translate = (endValue - 9) * 55;
                        this.digit2Bot.setAttribute("transform", "translate(0, " + translate + ")");
                        this.digit2Top.setAttribute("transform", "translate(0, " + translate + ")");
                    }
                    else {
                        this.digit2Bot.setAttribute("transform", "");
                        this.digit2Top.setAttribute("transform", "");
                    }
                    if (Math.abs(this.value) >= 99) {
                        let d1Value = (Math.abs(this.value) % 1000) / 100;
                        this.digit1Bot.textContent = Math.abs(this.value) < 100 ? "" : fastToFixed(Math.floor(d1Value), 0);
                        this.digit1Top.textContent = fastToFixed((Math.floor(d1Value) + 1) % 10, 0);
                        if (endValue > 9 && d2Value > 9) {
                            let translate = (endValue - 9) * 55;
                            this.digit1Bot.setAttribute("transform", "translate(0, " + translate + ")");
                            this.digit1Top.setAttribute("transform", "translate(0, " + translate + ")");
                        }
                        else {
                            this.digit1Bot.setAttribute("transform", "");
                            this.digit1Top.setAttribute("transform", "");
                        }
                    }
                    else {
                        this.digit1Bot.textContent = "";
                        this.digit1Top.textContent = "";
                    }
                }
                else {
                    this.digit2Bot.textContent = "-";
                    this.digit1Bot.textContent = "-";
                    this.digit1Bot.setAttribute("transform", "");
                    this.digit1Top.setAttribute("transform", "");
                    this.digit2Bot.setAttribute("transform", "");
                    this.digit2Top.setAttribute("transform", "");
                }
                break;
            case "airspeed-trend":
                this.trendValue = Math.min(Math.max(300 + parseFloat(newValue) * 6 * -5, 0), 600);
                this.trendElement.setAttribute("y", Math.min(this.trendValue, 300).toString());
                this.trendElement.setAttribute("height", Math.abs(this.trendValue - 300).toString());
				this.trendCursor.setAttribute("transform", "translate(0, " + Math.min(this.trendValue, 600).toString() + ")");
                break;
            case "min-speed":
                this.minValue = parseFloat(newValue);
                break;
            case "green-begin":
                this.greenBegin = parseFloat(newValue);
                break;
            case "green-end":
                this.greenEnd = parseFloat(newValue);
                break;
            case "yellow-begin":
                this.yellowBegin = parseFloat(newValue);
                break;
            case "yellow-end":
                this.yellowEnd = parseFloat(newValue);
                break;
            case "flaps-begin":
                this.flapsBegin = parseFloat(newValue);
                break;
            case "flaps-end":
                this.flapsEnd = parseFloat(newValue);
                break;
            case "red-begin":
                this.redBegin = parseFloat(newValue);
                break;
            case "red-end":
                this.redEnd = parseFloat(newValue);
                break;
            case "max-speed":
                this.maxValue = parseFloat(newValue);
                break;
            case "mach-airspeed":
                this.maText.textContent = parseFloat(newValue).toFixed(3); //fastToFixed(parseFloat(newValue), 2);
                break;
            case "reference-bugs":
                let elements;
                if (newValue != "") {
                    elements = newValue.split(";");
                }
                else {
                    elements = [];
                }
                for (let i = 0; i < elements.length; i++) {
                    if (i >= this.referenceBugs.length) {
                        let newRef = new ReferenceBug();
                        newRef.group = document.createElementNS(Avionics.SVG.NS, "g");
                        this.centerSvg.appendChild(newRef.group);
                        newRef.bug = document.createElementNS(Avionics.SVG.NS, "polygon");
                        newRef.bug.setAttribute("points", "200,300 210,315 250,315 250,285 210,285");
                        newRef.bug.setAttribute("fill", "#000100");
                        newRef.group.appendChild(newRef.bug);
                        newRef.text = document.createElementNS(Avionics.SVG.NS, "text");
                        newRef.text.setAttribute("fill", "#00ff00");
                        newRef.text.setAttribute("x", "230");
                        newRef.text.setAttribute("y", "310");
                        newRef.text.setAttribute("font-size", "25");
                        newRef.text.setAttribute("text-anchor", "middle");
                        newRef.text.setAttribute("font-family", "Roboto-Bold");
                        newRef.group.appendChild(newRef.text);
                        this.referenceBugs.push(newRef);
                    }
                    let values = elements[i].split(':');
                    this.referenceBugs[i].value = parseFloat(values[1]);
                    this.referenceBugs[i].text.textContent = values[0];
                    this.referenceBugs[i].group.setAttribute("transform", "translate(0," + ((this.value - this.referenceBugs[i].value) * 10) + ")");
                    this.referenceBugs[i].group.setAttribute("display", "");
                }
                for (let i = elements.length; i < this.referenceBugs.length; i++) {
                    this.referenceBugs[i].group.setAttribute("display", "none");
                }
                break;
            case "display-ref-speed":
                this.airspeedReferenceGroup.setAttribute("display", newValue == "True" ? "" : "none");
                break;
            case "ref-speed":
                this.selectedSpeedText.textContent = newValue;
                break;
        }
    }
}
customElements.define('glasscockpit-hud-airspeed-indicator', HudAirspeedIndicator);
//# sourceMappingURL=AirspeedIndicator.js.map