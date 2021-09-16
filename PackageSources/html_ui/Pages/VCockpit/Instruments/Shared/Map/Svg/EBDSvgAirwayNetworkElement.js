class EBDSvgAirwayNetworkElement extends SvgRoadNetworkElement {
    constructor() {
        super();
    }
	id(map) {
        return "airway-network" + "-map-" + map.index;
		;
    }
	updateDraw(map) {		
		if (!this._invisibleCanvases) {
			this._invisibleCanvases = [];
			this._invisibleCanvases[0] = new RoadCanvas(document.createElement("canvas"));
			this._invisibleCanvases[1] = new RoadCanvas(document.createElement("canvas"));
		}
        if (!this._visibleCanvas) {
            let canvasImage = map.htmlRoot.querySelector("#airway-network-canvas");
            if (!(canvasImage instanceof HTMLCanvasElement)) {
				console.log("No Airway Canvas");
                return;
            }
			console.log("Canvas Visible: " + this.visible);
            this._visibleCanvas = new RoadCanvas(canvasImage);
            if (this.visible)
                this._visibleCanvas.canvas.style.display = "block";
            else
                this._visibleCanvas.canvas.style.display = "none";
        }
		super.updateDraw(map);
    }
	onLatLongChanged(_map, _coords){
		super.onLatLongChanged(_map, _coords);
	}
	translateCanvas(_canvas, _x, _y, _rotation){
		super.translateCanvas(_canvas, _x, _y, _rotation);
	}
}
//# sourceMappingURL=EBDSvgAirwayNetworkElement.js.map