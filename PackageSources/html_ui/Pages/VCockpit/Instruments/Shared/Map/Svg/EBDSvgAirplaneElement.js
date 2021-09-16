class TrafficCanvas {
    constructor(_canvas) {
        this.canvas = _canvas;
        if (this.canvas)
            this.context2D = this.canvas.getContext("2d");
    }
}
class EBDNPCAirplaneManager extends NPCAirplaneManager {
    constructor() {
		super();
        this.npcAirplanes = [];
        this.useTCAS = false;
        this._timer = Infinity;
    }
    update() {
        this._timer++;
        if (this._timer >= 60) {
            this._timer = 0;
            Coherent.call("GET_AIR_TRAFFIC").then((obj) => {
                //console.log("Air Traffic Length: " + this.npcAirplanes.length);
                //console.log("OBJ Length: " + obj.length);
                for (let i = 0; i < this.npcAirplanes.length; i++) {
                    let npcAirplane = this.npcAirplanes[i];
                    npcAirplane.alive = 0;
                }
                for (let i = 0; i < obj.length; i++) {
                    let data = obj[i];
                    let npcAirplane = this.npcAirplanes.find(p => { return p.name === data.uId.toFixed(0); });
                    if (!npcAirplane) {
                        npcAirplane = new EBDSvgNPCAirplaneElement(data.uId.toFixed(0));
                        npcAirplane.useTCAS = this.useTCAS;
                        this.npcAirplanes.push(npcAirplane);
                    }
                    npcAirplane.alive = 3;
					npcAirplane.oldTime = npcAirplane.newTime;
					npcAirplane.newTime = performance.now();
					npcAirplane.oldLat = npcAirplane.targetLat;
					npcAirplane.oldLon = npcAirplane.targetLon;
                    npcAirplane.targetLat = obj[i].lat;
                    npcAirplane.targetLon = obj[i].lon;
                    npcAirplane.targetAlt = obj[i].alt;
                    npcAirplane.targetHeading = obj[i].heading;
					npcAirplane.timeDifference = npcAirplane.newTime - npcAirplane.oldTime;
					npcAirplane.distanceTraveled = this.calculateDistance(npcAirplane.oldLat, 
																				npcAirplane.oldLon, 
																				npcAirplane.targetLat, 
																				npcAirplane.targetLon);
					if(isFinite(npcAirplane.distanceTraveled) && npcAirplane.distanceTraveled > 0 && npcAirplane.timeDifference > 0){
						let metersPerSec = npcAirplane.distanceTraveled / (npcAirplane.timeDifference/1000);
						npcAirplane.speed = metersPerSec * 1.9438444924406;
						//console.log("Aircraft : " + npcAirplane.name + " Speed: " + npcAirplane.speed);
					}
                    if (isFinite(npcAirplane.lat) && isFinite(npcAirplane.lon) && isFinite(npcAirplane.alt)) {
                        npcAirplane.deltaLat = (npcAirplane.targetLat - npcAirplane.lat) / 60;
                        npcAirplane.deltaLon = (npcAirplane.targetLon - npcAirplane.lon) / 60;
                        npcAirplane.deltaAlt = (npcAirplane.targetAlt - npcAirplane.alt) / 60;
                        npcAirplane.targetHeading = Math.atan(npcAirplane.deltaLon / npcAirplane.deltaLat / Math.cos(npcAirplane.targetLat * Avionics.Utils.DEG2RAD)) * Avionics.Utils.RAD2DEG;
                        if (npcAirplane.deltaLat < 0) {
                            npcAirplane.targetHeading += 180;
                        }
                    }
                }
            });
        }
        for (let i = 0; i < this.npcAirplanes.length; i++) {
            let npcAirplane = this.npcAirplanes[i];
            npcAirplane.alive -= 1 / 60;
            if (npcAirplane.alive < 0) {
                this.npcAirplanes.splice(i, 1);
                i--;
            }
            else {
                if (isFinite(npcAirplane.lat) && isFinite(npcAirplane.lon) && isFinite(npcAirplane.heading)) {
                    npcAirplane.lat += npcAirplane.deltaLat;
                    npcAirplane.lon += npcAirplane.deltaLon;
                    npcAirplane.alt += npcAirplane.deltaAlt;
                    let deltaHeading = Avionics.Utils.diffAngle(npcAirplane.heading, npcAirplane.targetHeading);
                    if (deltaHeading > 60) {
                        npcAirplane.heading = npcAirplane.targetHeading;
                    }
                    else {
                        npcAirplane.heading = Avionics.Utils.lerpAngle(npcAirplane.heading, npcAirplane.targetHeading, 1 / 60);
                    }
                }
                else {
                    npcAirplane.lat = npcAirplane.targetLat;
                    npcAirplane.lon = npcAirplane.targetLon;
                    npcAirplane.alt = npcAirplane.targetAlt;
                    npcAirplane.heading = npcAirplane.targetHeading;
                }
            }
        }
		
    }
	calculateDistance(lat1, lon1, lat2, lon2){
		let R = 6371e3; // metres
		let φ1 = lat1 * Math.PI/180; // φ, λ in radians
		let φ2 = lat2 * Math.PI/180;
		let Δφ = (lat2-lat1) * Math.PI/180;
		let Δλ = (lon2-lon1) * Math.PI/180;

		let a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
				  Math.cos(φ1) * Math.cos(φ2) *
				  Math.sin(Δλ/2) * Math.sin(Δλ/2);
		let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

		return R * c; // in metres
	}
}
class EBDSvgNPCAirplaneElement extends SvgNPCAirplaneElement {
    constructor(name = "") {
        super();
		this.oldTime = 0;
		this.newTime = 0;
		this.timeDifference = 0;
		this.speed = 0;
		this.distanceTraveled = 0;
        this.name = name;
        this._delay = 120;
        this.alive = 5;
        this.useTCAS = false;
        this.lat = NaN;
        this.lon = NaN;
        this.oldLat = NaN;
        this.oldLon = NaN;
        this.alt = NaN;
        this.deltaLat = 0;
        this.deltaLon = 0;
        this.deltaAlt = 0;
        this.targetLat = NaN;
        this.targetLon = NaN;
        this.targetAlt = NaN;
        this.heading = NaN;
        this.targetHeading = NaN;
        this._lastHeading = NaN;
        this._lastCase = NaN;
		this.containerSize = 30;
        if (this.name === "") {
            this.name = "A" + Math.floor(Math.random() * 1000000).toFixed(0);
        }
        this._id = "npc-airplaine-" + this.name;
        this._pos = new Vec2();
    }
    id(map) {
        return this._id + "-map-" + map.index;
        ;
    }
    createDraw(map) {
        let container = document.createElementNS(Avionics.SVG.NS, "svg");
        container.id = this.id(map);
        container.setAttribute("width", this.containerSize);
        container.setAttribute("height", this.containerSize);
        container.setAttribute("overflow", "visible");
		
		let leader = document.createElementNS(Avionics.SVG.NS, "rect");
		leader.setAttribute("fill", "#e0e0e0");
		leader.setAttribute("x", fastToFixed((( this.containerSize ) * 0.5), 0));
		leader.setAttribute("y", fastToFixed((( this.containerSize ) * 0.5), 0)-200);
		leader.setAttribute("width", "2");
		leader.setAttribute("height", "200");
		container.appendChild(leader);
		
        let friendlyAirSymbol = document.createElementNS(Avionics.SVG.NS, "path");
		friendlyAirSymbol.setAttribute("x", fastToFixed((( this.containerSize ) * 0.5), 0));
		friendlyAirSymbol.setAttribute("y", fastToFixed((( this.containerSize ) * 0.5), 0));
		let halfCircle = "M " + 
			0 +
			" " + 
			fastToFixed((( this.containerSize ) * 0.5), 0) + 
			" A 15 15 0 0 1 " + 
			this.containerSize + 
			" " + 
			fastToFixed((( this.containerSize ) * 0.5), 0);
        friendlyAirSymbol.setAttribute("d", halfCircle);
        friendlyAirSymbol.setAttribute("fill", "none");
        friendlyAirSymbol.setAttribute("stroke", "#05c9ff");
        friendlyAirSymbol.setAttribute("stroke-width", "4");
        container.appendChild(friendlyAirSymbol);
		
		let flBackground = document.createElementNS(Avionics.SVG.NS, "rect");
		flBackground.setAttribute("x", fastToFixed((( -this.containerSize ) * 0.5), 0));
		flBackground.setAttribute("y", "-26");
		flBackground.setAttribute("width", this.containerSize*2);
		flBackground.setAttribute("height", "20");
		flBackground.setAttribute("fill", "#1a1d21");
		flBackground.setAttribute("fill-opacity", "0.5");
		container.appendChild(flBackground);
		
		let flText = document.createElementNS(Avionics.SVG.NS, "text");
		flText.setAttribute("x", fastToFixed((( 6-this.containerSize ) * 0.5), 0));
		flText.setAttribute("y", "-10");
		flText.setAttribute("fill", "#00ff00");
		flText.setAttribute("font-size", "18");
		flText.setAttribute("font-family", "Roboto-Bold");
		flText.setAttribute("text-anchor", "center");
		flText.textContent = "FL000";
		container.appendChild(flText);
			
        container.setAttribute("x", fastToFixed(((1000 - this.containerSize ) * 0.5), 0));
        container.setAttribute("y", fastToFixed(((1000 - this.containerSize ) * 0.5), 0));
        return container;
    }
    updateDraw(map) {
        if (this._delay > 0) {
            this._delay--;
            this.svgElement.setAttribute("x", "-1000");
            this.svgElement.setAttribute("y", "-1000");
            return;
        }
        if (!this.useTCAS) {
            if (this._lastHeading !== this.heading && isFinite(this.heading)) {
                if (this.svgElement.children[0] && this.svgElement.children[1] && this.svgElement.children[2] && this.svgElement.children[3]) {
                    this._lastHeading = this.heading;
                    let angle = this.heading;
                    if (map.rotateWithPlane) {
                        angle -= map.planeDirection;
                    }
                    let rotation = "rotate(" + 
						fastToFixed(angle, 1) + 
						" " + 
						fastToFixed((this.containerSize * 0.5), 1) + 
						" " + 
						fastToFixed((this.containerSize * 0.5), 1) + 
						")";
					this.svgElement.children[0].setAttribute("transform", rotation);
					this.svgElement.children[0].setAttribute("height", fastToFixed(this.speed/2, 0));
					this.svgElement.children[0].setAttribute("y", fastToFixed((( this.containerSize) * 0.5)-(this.speed * 0.5), 0));
					if(this.targetAlt * 3.2808 >= 10000)
						this.svgElement.children[3].textContent = "FL" + fastToFixed(this.targetAlt * 0.01 * 3.2808, 0);
					else
						this.svgElement.children[3].textContent = fastToFixed(this.targetAlt * 3.2808, 0);
                }
            }
        }
        map.coordinatesToXYToRef(new LatLong(this.lat, this.lon), this._pos);
        if (isFinite(this._pos.x) && isFinite(this._pos.y)) {
            this.svgElement.setAttribute("x", fastToFixed((this._pos.x - this.containerSize * 0.5), 1));
            this.svgElement.setAttribute("y", fastToFixed((this._pos.y - this.containerSize * 0.5), 1));
        }
        if (this.useTCAS) {
            let altitudeAGL = map.planeAltitude;
            let deltaAltitude = Math.abs(altitudeAGL - this.alt);
            let distanceHorizontal = Avionics.Utils.computeDistance(new LatLong(this.lat, this.lon), map.planeCoordinates);
            if (distanceHorizontal < 2 && altitudeAGL > 1000 && deltaAltitude < 800) {
                if (this._lastCase !== 0) {
                    this._image.setAttributeNS("http://www.w3.org/1999/xlink", "href", map.config.imagesDir + "ICON_MAP_TCAS_RA_A320.svg");
                    this.svgElement.setAttribute("visibility", "visible");
                    this._lastCase = 0;
                }
            }
            else if (distanceHorizontal < 4 && altitudeAGL > 500 && deltaAltitude < 1000) {
                if (this._lastCase !== 1) {
                    this._image.setAttributeNS("http://www.w3.org/1999/xlink", "href", map.config.imagesDir + "ICON_MAP_TCAS_TA_A320.svg");
                    this.svgElement.setAttribute("visibility", "visible");
                    this._lastCase = 1;
                }
            }
            else if (distanceHorizontal < 6 && deltaAltitude < 1200) {
                if (this._lastCase !== 2) {
                    this._image.setAttributeNS("http://www.w3.org/1999/xlink", "href", map.config.imagesDir + "ICON_MAP_TCAS_PROX_A320.svg");
                    this.svgElement.setAttribute("visibility", "visible");
                    this._lastCase = 2;
                }
            }
            else if (distanceHorizontal < 30 && deltaAltitude < 2700) {
                if (this._lastCase !== 3) {
                    this._image.setAttributeNS("http://www.w3.org/1999/xlink", "href", map.config.imagesDir + "ICON_MAP_TCAS_OTHER_A320.svg");
                    this.svgElement.setAttribute("visibility", "visible");
                    this._lastCase = 3;
                }
            }
            else {
                if (this._lastCase !== 4) {
                    this.svgElement.setAttribute("visibility", "hidden");
                    this._lastCase = 4;
                }
            }
        }
    }
}
//# sourceMappingURL=SvgAirplaneElement.js.map