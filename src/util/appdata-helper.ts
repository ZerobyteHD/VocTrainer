import * as fs from "fs";
import * as path from "path";

export const APPDATA = process.env.APPDATA;

/**
 * Hilfsklasse für den Umgang mit Daten in %APPDATA%
 */
export class APPDATA_HELPER {
    appdata_dir:string;
    data_file:string;
    content_cache:object;
    constructor(appdata_dir_name:string, data_file_name:string) {
        this.appdata_dir = path.join(APPDATA as string, appdata_dir_name);
        this.data_file = path.join(this.appdata_dir, data_file_name);
        this.content_cache = {};

        if(!fs.existsSync(this.appdata_dir)) {
            fs.mkdirSync(this.appdata_dir);
        }
        if(!fs.existsSync(this.data_file)) {
            fs.writeFileSync(this.data_file, "{}");
        } else {
            var content:object = JSON.parse(fs.readFileSync(this.data_file).toString());
            this.content_cache = content;
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