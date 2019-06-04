import {KeyGroup, ParsedKey} from "key-parser";
import * as _ from "lodash";

interface Properties {
    [key: string]: Properties | string;
}

export class ParsedPropertiesKey implements ParsedKey {
    constructor(private property: string) {
    }

    solver(key: this, input: string[]): boolean {
        return input.some(it => it === this.property);
    }
}

export class PropertiesKeyGroup implements KeyGroup {
    constructor(private properties: Properties) {
    }

    parser(key: string): ParsedKey {
        const prop = _.get(this.properties, key.substr(1));
        return new ParsedPropertiesKey(_.isString(prop) ? prop : "");
    }

    predicate(key: string): boolean {
        return key.startsWith('@');
    }
}
