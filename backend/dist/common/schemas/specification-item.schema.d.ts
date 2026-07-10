export declare class SpecificationItem {
    key: string;
    value: string;
}
export declare const SpecificationItemSchema: import("mongoose").Schema<SpecificationItem, import("mongoose").Model<SpecificationItem, any, any, any, any, any, SpecificationItem>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SpecificationItem, import("mongoose").Document<unknown, {}, SpecificationItem, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<SpecificationItem & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    key?: import("mongoose").SchemaDefinitionProperty<string, SpecificationItem, import("mongoose").Document<unknown, {}, SpecificationItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SpecificationItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    value?: import("mongoose").SchemaDefinitionProperty<string, SpecificationItem, import("mongoose").Document<unknown, {}, SpecificationItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SpecificationItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, SpecificationItem>;
