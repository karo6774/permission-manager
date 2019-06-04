import * as _ from "lodash";
import {KeyGroup, ParsedKey} from "key-parser";
import {PersonSupplier} from "./person";

export class ParsedUserTagKey implements ParsedKey {
    constructor(private supplier: PersonSupplier, private tag: string) {
    }

    solver(key: ParsedKey, input: string[]): boolean {
        return input.some(it => {
            if (it.startsWith('#')) {
                return it.substr(1) === this.tag;
            } else {
                const person = this.supplier(it);
                return person ? _.includes(person.tags, this.tag) : false;
            }
        });
    }
}

export class UserTagKeyGroup implements KeyGroup {
    constructor(private supplier: PersonSupplier) {
    }

    parser(key: string): ParsedKey {
        return new ParsedUserTagKey(this.supplier, key.substr(1));
    }

    predicate(key: string): boolean {
        return key.startsWith('#');
    }
}