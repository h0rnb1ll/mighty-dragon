class EBDMapInstrument extends MapInstrument {
    constructor() {
        super();
        this._ranges = [0.25, 0.5, 1, 2.5, 5, 10, 20, 40, 80, 120, 240, 512, 1024, 2048];
    }
    get templateID() { return "EBDMapInstrumentTemplate"; }
    init(arg) {
        super.init(arg);
        this.mapRangeElement = this.querySelector("#EBDMapRange");
        if (this.eBingMode !== EBingMode.HORIZON) {
            this.npcAirplaneManager = new EBDNPCAirplaneManager();
        }
    }
    refreshDisplay() {
        if (this.isDisplayingWeatherRadar() && this.weatherHideGPS) {
            if (this.navMap && this.navMap.svgHtmlElement)
                diffAndSetStyle(this.navMap.svgHtmlElement, StyleProperty.display, "block");
            if (this.lineCanvas)
                diffAndSetStyle(this.lineCanvas, StyleProperty.display, "none");
            if (this.roadNetwork)
                this.roadNetwork.setVisible(false);
            return;
        }
        if (this.quality == Quality.ultra || this.quality == Quality.high) {
            if (this.navMap && this.navMap.svgHtmlElement)
                diffAndSetStyle(this.navMap.svgHtmlElement, StyleProperty.display, "block");
            if (this.lineCanvas)
                diffAndSetStyle(this.lineCanvas, StyleProperty.display, "block");
            this.bingMap.setVisible(this.showBingMap);
        }
        else if (this.quality == Quality.medium) {
            if (this.navMap && this.navMap.svgHtmlElement)
                diffAndSetStyle(this.navMap.svgHtmlElement, StyleProperty.display, "block");
            if (this.lineCanvas)
                diffAndSetStyle(this.lineCanvas, StyleProperty.display, "none");
            this.bingMap.setVisible(this.showBingMap);
        }
        else {
            if (this.navMap && this.navMap.svgHtmlElement)
                diffAndSetStyle(this.navMap.svgHtmlElement, StyleProperty.display, "none");
            if (this.lineCanvas)
                diffAndSetStyle(this.lineCanvas, StyleProperty.display, "none");
            if (this.roadNetwork)
                this.roadNetwork.setVisible(false);
            if (this.quality == Quality.low || this.quality == Quality.hidden)
                this.bingMap.setVisible(this.showBingMap);
            else
                this.bingMap.setVisible(false);
        }
    }
    update(_deltaTime){
        super.update(_deltaTime);
        if (this.mapRangeElement) {
            //var range = '<div class="EBDAlign">' + this.getDisplayRange() + '</div><div class="EBDAlign unit">n<br/>m</div>';
            var range = this.getDisplayRange() + "nm";
            if (this.rangeValue != range) {
                this.mapRangeElement.innerHTML = range;
                this.rangeValue = range;
            }
        }
    }
}
customElements.define("ebd-map-instrument", EBDMapInstrument);
//# sourceMappingURL=EBDMapInstrument.js.map