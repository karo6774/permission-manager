import * as _ from "lodash";
import {Person, PersonSupplier} from "./person";
import {Permissions} from "./permissions";
import {traverse} from "./traversal";

export function has(subject: Person,
                    tags: { [tag: string]: Permissions },
                    permission: string,
                    supplier: PersonSupplier,
                    ...layers: Permissions[]): boolean
{
    const merged: Permissions = _.merge({},
        ..._(tags).pick(subject.tags).values().value(), // start with subject's tags
        subject.permissions, // then add subject's own permissions
        ...layers
    );

    return traverse(merged, {
        supplier,
        depth: 0,
        path: _.toPath(permission),
        properties: {subject: subject.id}
    });
}
