//Include.addScript("/JS/dataStorage.js");
class EBDDataIO {
    static set(key, value) {
        var storeKey = `${SimVar.GetSimVarValue("ATC MODEL", "string")}.${key}`;
		if(typeof(value) == "string" || 
			typeof(value) == "number" || 
			typeof(value) == "boolean")
		{
			SetStoredData(storeKey, value.toString());
			return value;
		}
        return null;
    }
    static get(key) {
        var storeKey = `${SimVar.GetSimVarValue("ATC MODEL", "string")}.${key}`;
		var storedValue = GetStoredData(storeKey);
		return storedValue;
    }
}