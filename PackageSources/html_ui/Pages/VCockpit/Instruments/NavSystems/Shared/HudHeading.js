class HudHeadingIndicator extends HTMLElement {
    constructor() {
        super();
    }
    static get observedAttributes() {
        return [
            "heading"
        ];
    }
    connectedCallback() {
        this.root = document.createElementNS(Avionics.SVG.NS, "svg");
        this.root.setAttribute("width", "100%");
        this.root.setAttribute("height", "100%");
        this.root.setAttribute("viewBox", "0 0 160 46");
        this.appendChild(this.root);
        {
            let background = document.createElementNS(Avionics.SVG.NS, "rect");
            background.setAttribute("x", "0");
            background.setAttribute("y", "0");
            background.setAttribute("width", "160");
            background.setAttribute("height", "46");
            background.setAttribute("fill", "#000100");
            background.setAttribute("fill-opacity", "1");
            this.root.appendChild(background);
            this.hdgText = document.createElementNS(Avionics.SVG.NS, "text");
            this.hdgText.setAttribute("x", "5");
            this.hdgText.setAttribute("y", "40");
            this.hdgText.setAttribute("fill", "#00ff00");
            this.hdgText.setAttribute("font-size", "48");
            this.hdgText.setAttribute("font-family", "Roboto-Bold");
            this.hdgText.setAttribute("text-anchor", "start");
            this.hdgText.textContent = "000";
            this.root.appendChild(this.hdgText);
            let headingText = document.createElementNS(Avionics.SVG.NS, "text");
            headingText.setAttribute("x", "150");
            headingText.setAttribute("y", "40");
            headingText.setAttribute("fill", "#00ff00");
            headingText.setAttribute("font-size", "48");
            headingText.setAttribute("font-family", "Roboto-Bold");
            headingText.setAttribute("text-anchor", "end");
            headingText.textContent = "°T";
            this.root.appendChild(headingText);
        }
    }
    attributeChangedCallback(name, oldValue, newValue) {
			this.hdgText.textContent = "Bah!";
        if (oldValue == newValue && name != "heading") {
            return;
		}
        switch (name) {
            case "heading":
				this.hdgText.textContent = parseFloat(newValue).toFixed(0); //fastToFixed(parseFloat(newValue), 2);
				break;
		}
    }
}
customElements.define('glasscockpit-hud-heading-indicator', HudHeadingIndicator);
//# sourceMappingURL=AirspeedIndicator.js.map