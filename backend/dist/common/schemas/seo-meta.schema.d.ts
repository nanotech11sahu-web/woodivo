export declare class SeoMeta {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
    canonicalUrl?: string;
}
export declare const SeoMetaSchema: import("mongoose").Schema<SeoMeta, import("mongoose").Model<SeoMeta, any, any, any, any, any, SeoMeta>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SeoMeta, import("mongoose").Document<unknown, {}, SeoMeta, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<SeoMeta & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    metaTitle?: import("mongoose").SchemaDefinitionProperty<string | undefined, SeoMeta, import("mongoose").Document<unknown, {}, SeoMeta, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SeoMeta & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    metaDescription?: import("mongoose").SchemaDefinitionProperty<string | undefined, SeoMeta, import("mongoose").Document<unknown, {}, SeoMeta, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SeoMeta & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    metaKeywords?: import("mongoose").SchemaDefinitionProperty<string[] | undefined, SeoMeta, import("mongoose").Document<unknown, {}, SeoMeta, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SeoMeta & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    ogImage?: import("mongoose").SchemaDefinitionProperty<string | undefined, SeoMeta, import("mongoose").Document<unknown, {}, SeoMeta, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SeoMeta & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    canonicalUrl?: import("mongoose").SchemaDefinitionProperty<string | undefined, SeoMeta, import("mongoose").Document<unknown, {}, SeoMeta, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SeoMeta & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, SeoMeta>;
