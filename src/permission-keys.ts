import * as _ from "lodash";
import {Context} from "./context";
import {KeyParser, WildcardKeyGroup} from "key-parser";
import {PropertiesKeyGroup} from "./properties-key-group";
import {UserTagKeyGroup} from "./user-tag-key-group";

export function findMatching(keys: string[], segment: string, context: Context): string | undefined {
    return _.find(keys, key => matches(key, segment, context));
}

export function matches(key: string, segment: string, context: Context): boolean {
    let compiled = compileKey(key, context);
    return compiled.match(segment, key, context);
}

function compileKey(segment: string, context: Context): CompiledKey {
    /*let type = identifyKeyType(segment);
    switch (type)
    {
        case "property_pattern":
            let property = PropertyPattern.makeParser(shrink(segment), context);
            return {match: (input, key) => property.has(input)};
        case "user_pattern":
            let user = UserPattern.makeParser(shrink(segment), context);
            return {match: (input, key) => user.has(input)};
        default:
        case "literal":
            return {match: (input, key) => input === key};
    }*/
    let [type, transformed] = identifyKeyType(segment);
    switch (type) {
        case "pattern": {
            const parser = new KeyParser();
            parser.addKeyGroup(new WildcardKeyGroup({allowUnknown: true}));
            parser.addKeyGroup(new PropertiesKeyGroup(_.cloneDeep(context.properties)));
            parser.addKeyGroup(new UserTagKeyGroup(context.supplier));
            const compiled = parser.compile(transformed);

            return {
                match(segment: string, key: string, context: Context): boolean {
                    return compiled.has(segment)
                }
            }
        }
        case "literal":
        default:
            return {match: (segment, key) => segment === key};
    }
}

function identifyKeyType(segment: string): [KeyType, string] {
    if (surroundedWith(segment, '[', ']'))
        return ["pattern", shrink(segment)];
    else return ["literal", segment];
}

/** @return Returns whether the input starts with prefix, and ends with suffix. */
function surroundedWith(input: string, prefix: string, suffix: string): boolean {
    return input.startsWith(prefix) && input.endsWith(suffix);
}

/** @return Removes the specified amount of characters from both ends of the input string. */
function shrink(input: string, amount: number = 1): string {
    return input.substring(amount, input.length - amount);
}

export type KeyType = "pattern" | "literal";

export interface CompiledKey {
    match(segment: string, key: string, context: Context): boolean;
}
