import {PersonSupplier} from "./person";

interface CustomProperties {
    [key: string]: CustomProperties | string;
}

export interface Context {
    path: string[];
    depth: number;
    supplier: PersonSupplier;
    properties: CustomProperties;
}
