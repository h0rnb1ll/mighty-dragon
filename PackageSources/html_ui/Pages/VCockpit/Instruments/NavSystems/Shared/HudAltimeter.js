class HudAltimeter extends HTMLElement {
    constructor() {
        super();
        this.currentCenterGrad = -10000;
        this.minimumAltitude = NaN;
    }
    static get observedAttributes() {
        return [
            "altitude",
            "radar-altitude",
            "reference-altitude",
            "minimum-altitude",
            "minimum-altitude-state",
            //"pressure",
            "vspeed",
            "reference-vspeed",
            "vertical-deviation-mode",
            "vertical-deviation-value",
            //"selected-altitude-alert"
        ];
    }
    connectedCallback() {
        this.root = document.createElementNS(Avionics.SVG.NS, "svg");
        this.root.setAttribute("width", "100%");
        this.root.setAttribute("height", "100%");
        this.root.setAttribute("viewBox", "-50 -50 380 650");
        this.appendChild(this.root);
        {
            this.verticalDeviationGroup = document.createElementNS(Avionics.SVG.NS, "g");
            this.verticalDeviationGroup.setAttribute("visibility", "hidden");
            this.root.appendChild(this.verticalDeviationGroup);
            let background = document.createElementNS(Avionics.SVG.NS, "rect");
            background.setAttribute("x", "-50");
            background.setAttribute("y", "-5");
            background.setAttribute("width", "50");
            background.setAttribute("height", "555");
            //background.setAttribute("stroke", "#00ff00");
            //background.setAttribute("stroke-width", "5");
            background.setAttribute("fill", "#000000");
            background.setAttribute("fill-opacity", "1");
            this.verticalDeviationGroup.appendChild(background);
            let topBackground = document.createElementNS(Avionics.SVG.NS, "rect");
            topBackground.setAttribute("x", "-50");
            topBackground.setAttribute("y", "-55");
            topBackground.setAttribute("width", "50");
            topBackground.setAttribute("height", "50");
            topBackground.setAttribute("stroke", "#00ff00");
            topBackground.setAttribute("stroke-width", "5");
            topBackground.setAttribute("fill", "#000000");
            this.verticalDeviationGroup.appendChild(topBackground);
            this.verticalDeviationText = document.createElementNS(Avionics.SVG.NS, "text");
            this.verticalDeviationText.setAttribute("x", "-25");
            this.verticalDeviationText.setAttribute("y", "-10");
            this.verticalDeviationText.setAttribute("fill", "#00ff00");
            this.verticalDeviationText.setAttribute("font-size", "45");
            this.verticalDeviationText.setAttribute("font-family", "Roboto-Bold");
            this.verticalDeviationText.setAttribute("text-anchor", "middle");
            this.verticalDeviationText.textContent = "V";
            this.verticalDeviationGroup.appendChild(this.verticalDeviationText);
            for (let i = -2; i <= 2; i++) {
                if (i != 0) {
                    let grad = document.createElementNS(Avionics.SVG.NS, "circle");
                    grad.setAttribute("cx", "-25");
                    grad.setAttribute("cy", (275 + 66 * i).toString());
                    grad.setAttribute("r", "6");
                    grad.setAttribute("stroke", "#00ff00");
                    grad.setAttribute("stroke-width", "3");
                    //grad.setAttribute("fill-opacity", "0");
                    this.verticalDeviationGroup.appendChild(grad);
                }
            }
            this.chevronBug = document.createElementNS(Avionics.SVG.NS, "polygon");
            this.chevronBug.setAttribute("points", "-45,275 -10,255 -10,265 -25,275 -10,285 -10,295");
            this.chevronBug.setAttribute("fill", "#00ff00");
            this.verticalDeviationGroup.appendChild(this.chevronBug);
            this.diamondBug = document.createElementNS(Avionics.SVG.NS, "polygon");
            this.diamondBug.setAttribute("points", "-40,275 -25,260 -10,275 -25,290");
            this.diamondBug.setAttribute("fill", "#00ff00");
            this.verticalDeviationGroup.appendChild(this.diamondBug);
            this.hollowDiamondBug = document.createElementNS(Avionics.SVG.NS, "polygon");
            this.hollowDiamondBug.setAttribute("points", "-40,275 -25,260 -10,275 -25,290 -25,280 -20,275 -25,270 -30,275 -25,280 -25,290");
            this.hollowDiamondBug.setAttribute("fill", "#00df00");
            this.verticalDeviationGroup.appendChild(this.hollowDiamondBug);
        }
        {
            this.selectedAltitudeBackground = document.createElementNS(Avionics.SVG.NS, "rect");
            this.selectedAltitudeBackground.setAttribute("x", "0");
            this.selectedAltitudeBackground.setAttribute("y", "-50");
            this.selectedAltitudeBackground.setAttribute("width", "200");
            this.selectedAltitudeBackground.setAttribute("height", "50");
            this.selectedAltitudeBackground.setAttribute("fill", "#000100");
            this.root.appendChild(this.selectedAltitudeBackground);
            this.selectedAltText = document.createElementNS(Avionics.SVG.NS, "text");
            this.selectedAltText.setAttribute("x", "10");
            this.selectedAltText.setAttribute("y", "-10");
            this.selectedAltText.setAttribute("fill", "#00ff00");
            this.selectedAltText.setAttribute("font-size", "45");
            this.selectedAltText.setAttribute("font-family", "Roboto");
            this.selectedAltText.setAttribute("text-anchor", "left");
            this.selectedAltText.textContent = "-----";
            this.root.appendChild(this.selectedAltText);
        }
        {
            let background = document.createElementNS(Avionics.SVG.NS, "rect");
            background.setAttribute("x", "0");
            background.setAttribute("y", "0");
            background.setAttribute("width", "200");
            background.setAttribute("height", "550");
            background.setAttribute("fill", "#000100");
            //background.setAttribute("stroke", "#00ff00");
            //background.setAttribute("stroke-width", "5");
            background.setAttribute("fill-opacity", "1");
            this.root.appendChild(background);
            let backgroundLine = document.createElementNS(Avionics.SVG.NS, "path");
            backgroundLine.setAttribute("d", "M 200 -5 l -200 0 l 0 555 l 200 0");
            backgroundLine.setAttribute("fill", "transparent");
            backgroundLine.setAttribute("stroke", "#00ff00");
            backgroundLine.setAttribute("stroke-width", "5");
            this.root.appendChild(backgroundLine);
            let graduationSvg = document.createElementNS(Avionics.SVG.NS, "svg");
            graduationSvg.setAttribute("x", "0");
            graduationSvg.setAttribute("y", "0");
            graduationSvg.setAttribute("width", "200");
            graduationSvg.setAttribute("height", "550");
            graduationSvg.setAttribute("viewBox", "0 0 200 550");
            this.root.appendChild(graduationSvg);
            let center = 275;
            this.graduationGroup = document.createElementNS(Avionics.SVG.NS, "g");
            graduationSvg.appendChild(this.graduationGroup);
            {
                let graduationSize = 62;
                this.graduationTexts = [];
                for (let i = -6; i <= 6; i++) {
                    let mainGrad = document.createElementNS(Avionics.SVG.NS, "rect");
                    mainGrad.setAttribute("x", "0");
                    mainGrad.setAttribute("y", fastToFixed(center - 2 + i * graduationSize, 0));
                    mainGrad.setAttribute("height", "4");
                    mainGrad.setAttribute("width", "20");
                    mainGrad.setAttribute("fill", "#00ff00");
                    this.graduationGroup.appendChild(mainGrad);
                    let gradText = document.createElementNS(Avionics.SVG.NS, "text");
                    gradText.setAttribute("x", "30");
                    gradText.setAttribute("y", fastToFixed(center + 16 + i * graduationSize, 0));
                    gradText.setAttribute("fill", "#00ff00");
                    gradText.setAttribute("font-size", "45");
                    gradText.setAttribute("font-family", "Roboto");
                    gradText.textContent = "XXXX";
                    this.graduationGroup.appendChild(gradText);
                    this.graduationTexts.push(gradText);
                    /*for (let j = 1; j < 5; j++) {
                        let grad = document.createElementNS(Avionics.SVG.NS, "rect");
                        grad.setAttribute("x", "0");
                        grad.setAttribute("y", fastToFixed(center - 2 + i * graduationSize + j * (graduationSize / 5), 0));
                        grad.setAttribute("height", "4");
                        grad.setAttribute("width", "15");
                        grad.setAttribute("fill", "#00ff00");
                        this.graduationGroup.appendChild(grad);
                    }*/
                }
            }
            this.trendElement = document.createElementNS(Avionics.SVG.NS, "rect");
            this.trendElement.setAttribute("x", "15");
            this.trendElement.setAttribute("y", "0");
            this.trendElement.setAttribute("width", "5");
            this.trendElement.setAttribute("height", "0");
            this.trendElement.setAttribute("fill", "#00ff00");
            this.root.appendChild(this.trendElement);
			{
				this.trendCursor = document.createElementNS(Avionics.SVG.NS, "path");
				this.trendCursor.setAttribute("d", "M 15 0 l -10 -10 l -30 0 l 0 20 l 30 0 Z");
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
            this.groundLine = document.createElementNS(Avionics.SVG.NS, "g");
            this.groundLine.setAttribute("transform", "translate(0, 700)");
            graduationSvg.appendChild(this.groundLine);
            {
                let background = document.createElementNS(Avionics.SVG.NS, "rect");
                background.setAttribute("fill", "#00cf00");
                background.setAttribute("stroke", "#00ff00");
                background.setAttribute("stroke-width", "4");
                background.setAttribute("x", "0");
                background.setAttribute("y", "0");
                background.setAttribute("width", "196");
                background.setAttribute("height", "550");
                this.groundLine.appendChild(background);
                let groundLineSvg = document.createElementNS(Avionics.SVG.NS, "svg");
                groundLineSvg.setAttribute("x", "0");
                groundLineSvg.setAttribute("y", "0");
                groundLineSvg.setAttribute("width", "200");
                groundLineSvg.setAttribute("height", "550");
                groundLineSvg.setAttribute("viewBox", "0 0 200 550");
                this.groundLine.appendChild(groundLineSvg);
                for (let i = -5; i <= 25; i++) {
                    let line = document.createElementNS(Avionics.SVG.NS, "rect");
                    line.setAttribute("fill", "#00ff00");
                    line.setAttribute("x", "0");
                    line.setAttribute("y", (-50 + i * 30).toString());
                    line.setAttribute("width", "200");
                    line.setAttribute("height", "4");
                    line.setAttribute("transform", "skewY(-30)");
                    groundLineSvg.appendChild(line);
                }
            }
            let cursor = document.createElementNS(Avionics.SVG.NS, "path");
            cursor.setAttribute("d", "M20 " + center + " L40 " + (center - 30) + " L130 " + (center - 30) + " L130 " + (center - 60) + " L200 " + (center - 60) + " L200 " + (center + 60) + " L130 " + (center + 60) + " L130 " + (center + 30) + " L40 " + (center + 30) + "Z");
            cursor.setAttribute("fill", "#000100");
            cursor.setAttribute("stroke", "#00ff00");
            cursor.setAttribute("stroke-width", "2");
            graduationSvg.appendChild(cursor);
            let cursorBaseSvg = document.createElementNS(Avionics.SVG.NS, "svg");
            cursorBaseSvg.setAttribute("x", "30");
            cursorBaseSvg.setAttribute("y", (center - 40).toString());
            cursorBaseSvg.setAttribute("width", "100");
            cursorBaseSvg.setAttribute("height", "80");
            cursorBaseSvg.setAttribute("viewBox", "0 0 100 80");
            graduationSvg.appendChild(cursorBaseSvg);
            {
                this.digit1Top = document.createElementNS(Avionics.SVG.NS, "text");
                this.digit1Top.setAttribute("x", "16");
                this.digit1Top.setAttribute("y", "-1");
                this.digit1Top.setAttribute("fill", "#00ff00");
                this.digit1Top.setAttribute("font-size", "50");
                this.digit1Top.setAttribute("font-family", "Roboto-Bold");
                this.digit1Top.textContent = "X";
                cursorBaseSvg.appendChild(this.digit1Top);
                this.digit1Bot = document.createElementNS(Avionics.SVG.NS, "text");
                this.digit1Bot.setAttribute("x", "16");
                this.digit1Bot.setAttribute("y", "57");
                this.digit1Bot.setAttribute("fill", "#00ff00");
                this.digit1Bot.setAttribute("font-size", "50");
                this.digit1Bot.setAttribute("font-family", "Roboto-Bold");
                this.digit1Bot.textContent = "X";
                cursorBaseSvg.appendChild(this.digit1Bot);
                this.digit2Top = document.createElementNS(Avionics.SVG.NS, "text");
                this.digit2Top.setAttribute("x", "44");
                this.digit2Top.setAttribute("y", "-1");
                this.digit2Top.setAttribute("fill", "#00ff00");
                this.digit2Top.setAttribute("font-size", "50");
                this.digit2Top.setAttribute("font-family", "Roboto-Bold");
                this.digit2Top.textContent = "X";
                cursorBaseSvg.appendChild(this.digit2Top);
                this.digit2Bot = document.createElementNS(Avionics.SVG.NS, "text");
                this.digit2Bot.setAttribute("x", "44");
                this.digit2Bot.setAttribute("y", "57");
                this.digit2Bot.setAttribute("fill", "#00ff00");
                this.digit2Bot.setAttribute("font-size", "50");
                this.digit2Bot.setAttribute("font-family", "Roboto-Bold");
                this.digit2Bot.textContent = "X";
                cursorBaseSvg.appendChild(this.digit2Bot);
                this.digit3Top = document.createElementNS(Avionics.SVG.NS, "text");
                this.digit3Top.setAttribute("x", "72");
                this.digit3Top.setAttribute("y", "-1");
                this.digit3Top.setAttribute("fill", "#00ff00");
                this.digit3Top.setAttribute("font-size", "50");
                this.digit3Top.setAttribute("font-family", "Roboto-Bold");
                this.digit3Top.textContent = "X";
                cursorBaseSvg.appendChild(this.digit3Top);
                this.digit3Bot = document.createElementNS(Avionics.SVG.NS, "text");
                this.digit3Bot.setAttribute("x", "72");
                this.digit3Bot.setAttribute("y", "57");
                this.digit3Bot.setAttribute("fill", "#00ff00");
                this.digit3Bot.setAttribute("font-size", "50");
                this.digit3Bot.setAttribute("font-family", "Roboto-Bold");
                this.digit3Bot.textContent = "X";
                cursorBaseSvg.appendChild(this.digit3Bot);
            }
            let cursorRotatingSvg = document.createElementNS(Avionics.SVG.NS, "svg");
            cursorRotatingSvg.setAttribute("x", "130");
            cursorRotatingSvg.setAttribute("y", (center - 60).toString());
            cursorRotatingSvg.setAttribute("width", "70");
            cursorRotatingSvg.setAttribute("height", "120");
            cursorRotatingSvg.setAttribute("viewBox", "0 -50 70 120");
            graduationSvg.appendChild(cursorRotatingSvg);
            {
                this.endDigitsGroup = document.createElementNS(Avionics.SVG.NS, "g");
                cursorRotatingSvg.appendChild(this.endDigitsGroup);
                this.endDigits = [];
                for (let i = -2; i <= 2; i++) {
                    let digit = document.createElementNS(Avionics.SVG.NS, "text");
                    digit.setAttribute("x", "7");
                    digit.setAttribute("y", (27 + 45 * i).toString());
                    digit.setAttribute("fill", "#00ff00");
                    digit.setAttribute("font-size", "50");
                    digit.setAttribute("font-family", "Roboto-Bold");
                    digit.textContent = "XX";
                    this.endDigits.push(digit);
                    this.endDigitsGroup.appendChild(digit);
                }
            }
        }
        {
			let verticalSpeedGroup = document.createElementNS(Avionics.SVG.NS, "g");
			verticalSpeedGroup.setAttribute("id", "VerticalSpeed");
			this.root.appendChild(verticalSpeedGroup);
			//let background = document.createElementNS(Avionics.SVG.NS, "path");
			//background.setAttribute("d", "M 0 0 l 0 500 l -75 0 l 0 -200 l 65 -50 l -65 -50 l 0 -200 Z");
			//background.setAttribute("fill", "#000100");
			//background.setAttribute("fill-opacity", "0.25");
			//verticalSpeedGroup.appendChild(background);
            /*
			let dashes = [-200, -100, 0, 100, 200];
			let height = 20;
			let width = 10;
			let fontSize = 30;
			for (let i = 0; i < dashes.length; i++) {
				let rect = document.createElementNS(Avionics.SVG.NS, "rect");
				//rect.setAttribute("x", (-40-((dashes[i] % 100) == 0 ? 2 * width : width)).toString());
				rect.setAttribute("x", "230");
				rect.setAttribute("y", (275 - dashes[i] - height / 2).toString());
				rect.setAttribute("height", height.toString());
				rect.setAttribute("width", ((dashes[i] % 100) == 0 ? 2 * width : width).toString());
				rect.setAttribute("fill", "000f00");
                rect.setAttribute("stroke", "#00ff00");
                rect.setAttribute("stroke-width", "4");
				verticalSpeedGroup.appendChild(rect);
			}
			{
				this.indicator = document.createElementNS(Avionics.SVG.NS, "g");
				verticalSpeedGroup.appendChild(this.indicator);
				let indicatorBackground = document.createElementNS(Avionics.SVG.NS, "rect");
				indicatorBackground.setAttribute("x", "210");
				indicatorBackground.setAttribute("y", "265");
				indicatorBackground.setAttribute("height", "20");
				indicatorBackground.setAttribute("width", "60");
				indicatorBackground.setAttribute("fill", "000f00");
                indicatorBackground.setAttribute("stroke", "#00ff00");
                indicatorBackground.setAttribute("stroke-width", "4");
				//indicatorBackground.setAttribute("d", "M210 250 L235 275 L330 275 L330 225 L235 225 Z");
				//indicatorBackground.setAttribute("fill", "#00ff00");
				this.indicator.appendChild(indicatorBackground);
			}
            {
                let vsText = document.createElementNS(Avionics.SVG.NS, "text");
                vsText.textContent = "VS";
                vsText.setAttribute("y", "590");
                vsText.setAttribute("x", "170");
                vsText.setAttribute("fill", "#00ff00");
                vsText.setAttribute("font-size", "24");
                vsText.setAttribute("font-family", "Roboto-Bold");
                vsText.setAttribute("text-anchor", "end");
                this.root.appendChild(vsText);

            }
            */
            this.vsNumber = document.createElementNS(Avionics.SVG.NS, "text");
            this.vsNumber.textContent = "----";
            this.vsNumber.setAttribute("y", "590");
            this.vsNumber.setAttribute("x", "140");
            this.vsNumber.setAttribute("fill", "#00ff00");
            this.vsNumber.setAttribute("font-size", "42");
            this.vsNumber.setAttribute("font-family", "Roboto-Bold");
            this.vsNumber.setAttribute("text-anchor", "end");
            this.root.appendChild(this.vsNumber);
		}
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue == newValue)
            return;
        switch (name) {
            case "altitude":
                let value = parseFloat(newValue);
                this.altitude = value;
                let center = Math.round(value / 100) * 100;
                this.graduationGroup.setAttribute("transform", "translate(0, " + ((value - center) * 62 / 100) + ")");
                if (this.currentCenterGrad != center) {
                    this.currentCenterGrad = center;
                    for (let i = 0; i < this.graduationTexts.length; i++) {
                        if((((6-i)*100)+center) % 200){
                            this.graduationTexts[i].textContent = "";
                        } else {
                            this.graduationTexts[i].textContent = fastToFixed(((6 - i) * 100) + center, 0);
                        }
                    }
                }
                let endValue = value % 100;
                let endCenter = Math.round(endValue / 20) * 20;
                this.endDigitsGroup.setAttribute("transform", "translate(0, " + ((endValue - endCenter) * 45 / 20) + ")");
                for (let i = 0; i < this.endDigits.length; i++) {
                    let digitValue = Math.round((((2 - i) * 20) + value) % 100 / 20) * 20;
                    this.endDigits[i].textContent = fastToFixed(Math.abs((digitValue % 100) / 10), 0) + "0";
                }
                if (Math.abs(value) >= 90) {
                    let d3Value = (Math.abs(value) % 1000) / 100;
                    this.digit3Bot.textContent = Math.abs(value) < 100 ? "" : fastToFixed(Math.floor(d3Value), 0);
                    this.digit3Top.textContent = fastToFixed((Math.floor(d3Value) + 1) % 10, 0);
                    if (endValue > 90 || endValue < -90) {
                        if (endValue < 0) {
                            this.digit3Bot.textContent = fastToFixed((Math.floor(d3Value) + 1) % 10, 0);
                            this.digit3Top.textContent = Math.abs(value) < 100 ? "" : fastToFixed(Math.floor(d3Value), 0);
                        }
                        let translate = (endValue > 0 ? (endValue - 90) : (endValue + 100)) * 5.7;
                        this.digit3Bot.setAttribute("transform", "translate(0, " + translate + ")");
                        this.digit3Top.setAttribute("transform", "translate(0, " + translate + ")");
                    }
                    else {
                        this.digit3Bot.setAttribute("transform", "");
                        this.digit3Top.setAttribute("transform", "");
                    }
                    if (Math.abs(value) >= 990) {
                        let d2Value = (Math.abs(value) % 10000) / 1000;
                        this.digit2Bot.textContent = Math.abs(value) < 1000 ? "" : fastToFixed(Math.floor(d2Value), 0);
                        this.digit2Top.textContent = fastToFixed((Math.floor(d2Value) + 1) % 10, 0);
                        if ((endValue > 90 || endValue < -90) && d3Value > 9) {
                            if (endValue < 0) {
                                this.digit2Bot.textContent = fastToFixed((Math.floor(d2Value) + 1) % 10, 0);
                                this.digit2Top.textContent = Math.abs(value) < 1000 ? "" : fastToFixed(Math.floor(d2Value), 0);
                            }
                            let translate = (endValue > 0 ? (endValue - 90) : (endValue + 100)) * 5.7;
                            this.digit2Bot.setAttribute("transform", "translate(0, " + translate + ")");
                            this.digit2Top.setAttribute("transform", "translate(0, " + translate + ")");
                        }
                        else {
                            this.digit2Bot.setAttribute("transform", "");
                            this.digit2Top.setAttribute("transform", "");
                        }
                        if (Math.abs(value) >= 9990) {
                            let d1Value = (Math.abs(value) % 100000) / 10000;
                            this.digit1Bot.textContent = Math.abs(value) < 10000 ? "" : fastToFixed(Math.floor(d1Value), 0);
                            this.digit1Top.textContent = fastToFixed((Math.floor(d1Value) + 1) % 10, 0);
                            if ((endValue > 90 || endValue < -90) && d3Value > 9 && d2Value > 9) {
                                if (endValue < 0) {
                                    this.digit1Bot.textContent = fastToFixed((Math.floor(d2Value) + 1) % 10, 0);
                                    this.digit1Top.textContent = Math.abs(value) < 10000 ? "" : fastToFixed(Math.floor(d2Value), 0);
                                }
                                let translate = (endValue > 0 ? (endValue - 90) : (endValue + 100)) * 5.7;
                                this.digit1Bot.setAttribute("transform", "translate(0, " + translate + ")");
                                this.digit1Top.setAttribute("transform", "translate(0, " + translate + ")");
                            }
                            else {
                                this.digit1Bot.setAttribute("transform", "");
                                this.digit1Top.setAttribute("transform", "");
                            }
                        }
                        else {
                            this.digit1Bot.setAttribute("transform", "");
                            this.digit1Top.setAttribute("transform", "");
                            if (value < 0) {
                                this.digit1Bot.textContent = "-";
                            }
                            else {
                                this.digit1Bot.textContent = "";
                            }
                            this.digit1Top.textContent = "";
                        }
                    }
                    else {
                        this.digit2Bot.setAttribute("transform", "");
                        this.digit2Top.setAttribute("transform", "");
                        if (value < 0) {
                            this.digit2Bot.textContent = "-";
                        }
                        else {
                            this.digit2Bot.textContent = "";
                        }
                        this.digit1Bot.textContent = "";
                        this.digit1Top.textContent = "";
                        this.digit2Top.textContent = "";
                    }
                }
                else {
                    if (value < 0) {
                        this.digit3Bot.textContent = "-";
                    }
                    else {
                        this.digit3Bot.textContent = "";
                    }
                    this.digit2Bot.textContent = "";
                    this.digit1Bot.textContent = "";
                    this.digit2Top.textContent = "";
                    this.digit1Top.textContent = "";
                    this.digit3Bot.setAttribute("transform", "");
                    this.digit3Top.setAttribute("transform", "");
                }
                break;
            case "radar-altitude":
                this.groundLine.setAttribute("transform", "translate(0," + Math.min(300 + parseFloat(newValue) * 160 / 100, 700) + ")");
                break;
            case "reference-altitude":
                this.selectedAltText.textContent = newValue;
                if (newValue != "----") {
                    this.selectedAltitude = parseFloat(newValue);
                    //this.selectedAltitudeBug.setAttribute("transform", "translate(0, " + (Math.round(this.altitude / 100) * 100 - this.selectedAltitude) * 160 / 100 + ")");
                    //this.selectedAltitudeBug.setAttribute("display", "");
                }
                else {
                    //this.selectedAltitudeBug.setAttribute("display", "none");
                }
                break;
            case "vspeed":
                let vSpeed = parseFloat(newValue);
				//this.indicator.setAttribute("transform", "translate(0, " + -Math.max(Math.min(vSpeed, 2500), -2500) / 10 + ")");
                let fpm = 2000;
                let fpmScalar = fpm/25;
                let trendValue = Math.min(Math.max(275 + (vSpeed / fpmScalar) * -2.5, 0), 550);
                this.trendElement.setAttribute("y", Math.min(trendValue, 275).toString());
                this.trendElement.setAttribute("height", Math.abs(trendValue - 275).toString());
				this.trendCursor.setAttribute("transform", "translate(0, " + Math.min(trendValue, 550).toString() + ")");
                let vSpeedRounded = Math.round(vSpeed / 50)*50;
                this.vsNumber.textContent = fastToFixed(vSpeedRounded, 0).toString();
                break;
            case "vertical-deviation-mode":
                switch (newValue) {
                    case "VDI":
                        this.currentMode = 1;
                        this.verticalDeviationText.textContent = "V";
                        this.verticalDeviationText.setAttribute("fill", "#d12bc7");
                        this.diamondBug.setAttribute("visibility", "hidden");
                        this.chevronBug.setAttribute("visibility", "inherit");
                        this.hollowDiamondBug.setAttribute("visibility", "hidden");
                        this.verticalDeviationGroup.setAttribute("visibility", "inherit");
                        break;
                    case "GS":
                        this.currentMode = 2;
                        this.verticalDeviationText.textContent = "G";
                        this.verticalDeviationText.setAttribute("fill", "#10c210");
                        this.diamondBug.setAttribute("visibility", "inherit");
                        this.diamondBug.setAttribute("fill", "#10c210");
                        this.chevronBug.setAttribute("visibility", "hidden");
                        this.hollowDiamondBug.setAttribute("visibility", "hidden");
                        this.verticalDeviationGroup.setAttribute("visibility", "inherit");
                        break;
                    case "GSPreview":
                        this.currentMode = 4;
                        this.verticalDeviationText.textContent = "G";
                        this.verticalDeviationText.setAttribute("fill", "#DFDFDF");
                        this.diamondBug.setAttribute("visibility", "hidden");
                        this.chevronBug.setAttribute("visibility", "hidden");
                        this.hollowDiamondBug.setAttribute("visibility", "inherit");
                        this.verticalDeviationGroup.setAttribute("visibility", "inherit");
                        break;
                    case "GP":
                        this.currentMode = 3;
                        this.verticalDeviationText.textContent = "G";
                        this.verticalDeviationText.setAttribute("fill", "#d12bc7");
                        this.diamondBug.setAttribute("visibility", "inherit");
                        this.diamondBug.setAttribute("fill", "#d12bc7");
                        this.chevronBug.setAttribute("visibility", "hidden");
                        this.hollowDiamondBug.setAttribute("visibility", "hidden");
                        this.verticalDeviationGroup.setAttribute("visibility", "inherit");
                        break;
                    default:
                        this.currentMode = 0;
                        this.verticalDeviationGroup.setAttribute("visibility", "hidden");
                        break;
                }
                break;
            case "vertical-deviation-value":
                let pos = (Math.min(Math.max(parseFloat(newValue), -1), 1) * 200);
                this.chevronBug.setAttribute("transform", "translate(0," + pos + ")");
                this.diamondBug.setAttribute("transform", "translate(0," + pos + ")");
                this.hollowDiamondBug.setAttribute("transform", "translate(0," + pos + ")");
                break;
        }
    }
}
customElements.define('glasscockpit-hud-altimeter', HudAltimeter);
//# sourceMappingURL=Altimeter.js.map