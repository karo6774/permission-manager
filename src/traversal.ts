import {Permissions} from "./permissions";
import {Context} from "./context";
import * as _ from "lodash";
import {findMatching, matches} from "./permission-keys";

export function traverse(permissions: Permissions, context: Context): boolean {
    let keys = _.keys(permissions);
    let match = findMatching(keys, context.path[context.depth], context);
    if (match === undefined) return false;

    let result = permissions[match];
    if (_.isBoolean(result)) return result as boolean;
    if (_.isString(result)) {
        const newContext = _.assign({}, context, {depth: context.depth + 1});
        return matches(result, context.path[context.depth + 1], newContext);
    }
    if (!_.isObjectLike(result)) return false; // if it's not an object we can't traverse further
    return traverse(result, _.assign({}, context, {depth: context.depth + 1}));
}
