import {Permissions} from "./permissions";

export interface Person
{
    id: string;
    tags: string[];
    permissions: Permissions;
}

export type PersonSupplier = (name: string) => Person | undefined;
