import { HydratedDocument } from 'mongoose';
export type FaqDocument = HydratedDocument<Faq>;
export declare enum FaqStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export declare class Faq {
    question: string;
    answer: string;
    group?: string;
    displayOrder: number;
    status: FaqStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const FaqSchema: import("mongoose").Schema<Faq, import("mongoose").Model<Faq, any, any, any, any, any, Faq>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Faq, import("mongoose").Document<unknown, {}, Faq, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    question?: import("mongoose").SchemaDefinitionProperty<string, Faq, import("mongoose").Document<unknown, {}, Faq, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    answer?: import("mongoose").SchemaDefinitionProperty<string, Faq, import("mongoose").Document<unknown, {}, Faq, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    group?: import("mongoose").SchemaDefinitionProperty<string | undefined, Faq, import("mongoose").Document<unknown, {}, Faq, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    displayOrder?: import("mongoose").SchemaDefinitionProperty<number, Faq, import("mongoose").Document<unknown, {}, Faq, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<FaqStatus, Faq, import("mongoose").Document<unknown, {}, Faq, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Faq, import("mongoose").Document<unknown, {}, Faq, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Faq, import("mongoose").Document<unknown, {}, Faq, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Faq>;
