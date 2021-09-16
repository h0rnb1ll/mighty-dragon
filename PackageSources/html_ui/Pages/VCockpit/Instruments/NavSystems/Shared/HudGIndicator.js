class HudGIndicator extends HTMLElement {
    constructor() {
        super();
    }
    static get observedAttributes() {
        return [
            "gforce"
        ];
    }
    connectedCallback() {
        this.root = document.createElementNS(Avionics.SVG.NS, "svg");
        this.root.setAttribute("width", "100%");
        this.root.setAttribute("height", "100%");
        this.root.setAttribute("viewBox", "-10 -35 160 150");
        this.appendChild(this.root);
        {
            let circleBackground = document.createElementNS(Avionics.SVG.NS, "path");
            circleBackground.setAttribute("d", "M 75 -30 A 50 50 0 1 1 74 -30 Z");
            circleBackground.setAttribute("fill", "#000100");
            circleBackground.setAttribute("fill-opacity", "1");
            this.root.appendChild(circleBackground);
            let background = document.createElementNS(Avionics.SVG.NS, "rect");
            background.setAttribute("x", "-10");
            background.setAttribute("y", "0");
            background.setAttribute("width", "100");
            background.setAttribute("height", "40");
            background.setAttribute("fill", "#000100");
            background.setAttribute("fill-opacity", "1");
            this.root.appendChild(background);
            let ring = document.createElementNS(Avionics.SVG.NS, "path");
            ring.setAttribute("d", "M 40 -15 A 50 50 0 1 1 71 70"); // 240 degrees
            ring.setAttribute("stroke", "#00ff00");
            ring.setAttribute("stroke-width", "3");
            this.root.appendChild(ring);
            let ringContainer = document.createElementNS(Avionics.SVG.NS, "g");
            ringContainer.setAttribute("transform", "translate(75 20)");
            this.root.appendChild(ringContainer);
            let dashes = [-45, 0, 45, 90, 135, 180];
            let radius = 40;
            let width = 5;
            let height = 10;
            for (let i = 0; i < dashes.length; i++) {
                let dash = document.createElementNS(Avionics.SVG.NS, "rect");
                dash.setAttribute("x", ((-width / 2)).toString());
                dash.setAttribute("y", (-radius - height).toString());
                dash.setAttribute("height", height.toString());
                dash.setAttribute("width", width.toString());
                dash.setAttribute("fill", "#00ff00");
                dash.setAttribute("transform", "rotate(" + dashes[i] + ",0,0)");
                //dash.setAttribute("transform", "translate(0 0)");
                ringContainer.appendChild(dash);
            }
            this.needle = document.createElementNS(Avionics.SVG.NS, "rect");
            this.needle.setAttribute("x", "-3");
            this.needle.setAttribute("y", "0");
            this.needle.setAttribute("height", "40");
            this.needle.setAttribute("width", "5");
            this.needle.setAttribute("fill", "#00ff00");
            this.needle.setAttribute("transform", "rotate(-90,0,0)");
            ringContainer.appendChild(this.needle);
            this.gText = document.createElementNS(Avionics.SVG.NS, "text");
            this.gText.setAttribute("x", "65");
            this.gText.setAttribute("y", "30");
            this.gText.setAttribute("fill", "#00ff00");
            this.gText.setAttribute("font-size", "32");
            this.gText.setAttribute("font-family", "Roboto-Bold");
            this.gText.setAttribute("text-anchor", "end");
            this.gText.textContent = "000";
            this.root.appendChild(this.gText);
        }
    }
    attributeChangedCallback(name, oldValue, newValue) {
			this.gText.textContent = "0.0";
        if (oldValue == newValue && name != "gforce") {
            return;
		}
        switch (name) {
            case "gforce":
                let gforceValue = parseFloat(newValue);
				this.gText.textContent = gforceValue.toFixed(1); //fastToFixed(parseFloat(newValue), 2);
                this.needle.setAttribute("transform", "rotate(" + ((-(gforceValue-1) * 13.5) - 90.0) + ",0,0)");
				break;
		}
    }
}
customElements.define('glasscockpit-hud-g-indicator', HudGIndicator);
//# sourceMappingURL=AirspeedIndicator.js.map