const weaponCodesL = [
    "weaponL1","weaponL2"
];
const weaponCodesR = [
    "weaponR2","weaponR1"
];
const weaponCodesM = [
    "weaponM1","weaponM2","weaponM3","weaponM4"
];

class J20_Weapons extends NavSystemElementContainer {
    constructor(_name, _root) {
        super(_name, _root, null);
        this.mainDoorStatus = lbl_shut;
        this.leftDoorStatus = lbl_shut;
        this.rightDoorStatus = lbl_shut;
        this.jammerStatus = lbl_shut;
        this.flareStatus = lbl_shut;
    }

    init() {
        super.init();
        SimVar.SetSimVarValue(simvar_wpn_door_main,"number",0);
        SimVar.SetSimVarValue(simvar_wpn_door_l,"number",0);
        SimVar.SetSimVarValue(simvar_wpn_door_r,"number",0);
        SimVar.SetSimVarValue(simvar_wpn_jammer,"number",0);
        SimVar.SetSimVarValue(simvar_wpn_flare,"number",0);
    }

    updateReadiness(simvarName) {
        var doorStatus = SimVar.GetSimVarValue(simvar, "number");
        switch(doorStatus) {
            case 0:
                SimVar.SetSimVarValue(simvarName,"number", 1);
                SimVar.SetSimVarValue(simvarName,"number", 2);
                break;
            case 2:
                SimVar.SetSimVarValue(simvarName,"number", 0);
                break;
        }
    }

    getReadiness(simvarName) {
        var status = SimVar.GetSimVarValue(simvarName, "number");
        switch (status) {
            case 0: return lbl_shut;
            case 1: return lbl_loading;
            case 2: return lbl_ready;
        }
        return lbl_shut;
    }

    checkWeapon(weaponCode) {
        var weaponElement = document.getElementById(weaponCode);
        weaponElement.style.backgroundColor = "rgba(255,165,0,0.5)";
        setTimeout(()=>{
            weaponElement.style.backgroundColor = "rgba(124,252,0,0.5)";
        },3000);
        setTimeout(()=>{
            weaponElement.style.backgroundColor = "rgba(0,0,0,0.5)";
        },7000);
    }

    checkAllWeapons() {
        weaponCodesM.forEach((key,i,arr)=>{
            //this.j20systems.showMessage({text:'主武器检测中...',color:'orage'},true);
            this.checkWeapon(key);
            //this.j20systems.showMessage({text:'主武器检测完毕 无异常',color:'lawngreed'})
        });
        weaponCodesL.forEach((key,i,arr)=>{
            //this.j20systems.showMessage({text:'左武器检测中...',color:'orage'});
            this.checkWeapon(key);
            //this.j20systems.showMessage({text:'左武器检测完毕 无异常',color:'lawngreed'})
        });
        weaponCodesR.forEach((key,i,arr)=>{
            //this.j20systems.showMessage({text:'右武器检测中...',color:'orage'});
            this.checkWeapon(key);
            //this.j20systems.showMessage({text:'右武器检测完毕 无异常',color:'lawngreed'})
        });
    }
}