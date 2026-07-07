export declare class MediaAsset {
    url: string;
    publicId?: string;
    alt?: string;
    width?: number;
    height?: number;
}
export declare const MediaAssetSchema: import("mongoose").Schema<MediaAsset, import("mongoose").Model<MediaAsset, any, any, any, any, any, MediaAsset>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MediaAsset, import("mongoose").Document<unknown, {}, MediaAsset, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<MediaAsset & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    url?: import("mongoose").SchemaDefinitionProperty<string, MediaAsset, import("mongoose").Document<unknown, {}, MediaAsset, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MediaAsset & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    publicId?: import("mongoose").SchemaDefinitionProperty<string | undefined, MediaAsset, import("mongoose").Document<unknown, {}, MediaAsset, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MediaAsset & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    alt?: import("mongoose").SchemaDefinitionProperty<string | undefined, MediaAsset, import("mongoose").Document<unknown, {}, MediaAsset, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MediaAsset & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    width?: import("mongoose").SchemaDefinitionProperty<number | undefined, MediaAsset, import("mongoose").Document<unknown, {}, MediaAsset, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MediaAsset & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    height?: import("mongoose").SchemaDefinitionProperty<number | undefined, MediaAsset, import("mongoose").Document<unknown, {}, MediaAsset, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MediaAsset & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, MediaAsset>;
