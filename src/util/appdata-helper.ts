import * as fs from "fs";
import * as path from "path";

export const APPDATA = process.env.APPDATA;

export interface APPDATA_DATA_OBJECT {
    [key:string]: any;
}

/**
 * z.B. >property1>child1
 */
export function getPropertyFromPattern(data: APPDATA_DATA_OBJECT, pattern: string):APPDATA_DATA_OBJECT|any {
    var current = data;
    var splits = pattern.split(">");
    for(var i = 0; i < splits.length; i++) {
        let split = splits[i];
        if(split) {
            if(current[split]) {
                current = current[split];
            } else {
                throw "Undefined property name for type "+typeof current;
            }
        }
    }
    return current;
}

export class APPDATA_DATA {
    data: APPDATA_DATA_OBJECT;

    constructor(_data: APPDATA_DATA_OBJECT) {
        this.data = _data;
    }
    hasProperty(pattern: string):boolean {
        try {
            var res = getPropertyFromPattern(this.data, pattern);
            return true;
        } catch(e:any) {
            return false;
        }
    }
    getProperty(pattern: string):APPDATA_DATA_OBJECT|any|null {
        if(this.hasProperty(pattern)){
            return getPropertyFromPattern(this.data, pattern);
        } else return null;
    }
}

/**
 * Hilfsklasse für den Umgang mit Daten in %APPDATA%
 */
export class APPDATA_HELPER {
    appdata_dir:string;
    data_file:string;

    /**
     * Konstruktor
     * @param appdata_dir_name Name des Subordners in AppData 
     * @param data_file_name Der Name der Datei, in der die Daten gespeichert werden
     */
    constructor(appdata_dir_name:string, data_file_name:string) {
        this.appdata_dir = path.join(APPDATA as string, appdata_dir_name);
        this.data_file = path.join(this.appdata_dir, data_file_name);

        if(!fs.existsSync(this.appdata_dir)) {
            fs.mkdirSync(this.appdata_dir);
        }
        if(!fs.existsSync(this.data_file)) {
            fs.writeFileSync(this.data_file, "{}");
        }
    }
    read() {
        var data = fs.readFileSync(this.data_file).toString();
        return JSON.parse(data);
    }
    write(data_obj:object) {
        fs.writeFileSync(this.data_file, JSON.stringify(data_obj));
    }
    write_prop(prop:string, value:any) {
        var data = this.read();
        data[prop] = value;
        this.write(data);
    }
}