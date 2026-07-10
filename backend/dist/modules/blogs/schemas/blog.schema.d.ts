import { HydratedDocument } from 'mongoose';
import { MediaAsset } from "../../../common/schemas/media-asset.schema";
export type BlogDocument = HydratedDocument<Blog>;
export declare enum BlogStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    SCHEDULED = "scheduled",
    ARCHIVED = "archived"
}
export declare class BlogCategory {
    name: string;
    slug: string;
    displayOrder: number;
}
export type BlogCategoryDocument = HydratedDocument<BlogCategory>;
export declare const BlogCategorySchema: import("mongoose").Schema<BlogCategory, import("mongoose").Model<BlogCategory, any, any, any, any, any, BlogCategory>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, BlogCategory, import("mongoose").Document<unknown, {}, BlogCategory, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<BlogCategory & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, BlogCategory, import("mongoose").Document<unknown, {}, BlogCategory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BlogCategory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    slug?: import("mongoose").SchemaDefinitionProperty<string, BlogCategory, import("mongoose").Document<unknown, {}, BlogCategory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BlogCategory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    displayOrder?: import("mongoose").SchemaDefinitionProperty<number, BlogCategory, import("mongoose").Document<unknown, {}, BlogCategory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BlogCategory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, BlogCategory>;
export declare class BlogFaqItem {
    question: string;
    answer: string;
}
export declare const BlogFaqItemSchema: import("mongoose").Schema<BlogFaqItem, import("mongoose").Model<BlogFaqItem, any, any, any, any, any, BlogFaqItem>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, BlogFaqItem, import("mongoose").Document<unknown, {}, BlogFaqItem, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<BlogFaqItem & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    question?: import("mongoose").SchemaDefinitionProperty<string, BlogFaqItem, import("mongoose").Document<unknown, {}, BlogFaqItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BlogFaqItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    answer?: import("mongoose").SchemaDefinitionProperty<string, BlogFaqItem, import("mongoose").Document<unknown, {}, BlogFaqItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BlogFaqItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, BlogFaqItem>;
export declare class Blog {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featuredImage?: MediaAsset;
    images: MediaAsset[];
    faqs: BlogFaqItem[];
    category?: string;
    tags: string[];
    status: BlogStatus;
    publishAt?: Date;
    isFeatured: boolean;
    authorName?: string;
    viewCount: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const BlogSchema: import("mongoose").Schema<Blog, import("mongoose").Model<Blog, any, any, any, any, any, Blog>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Blog, import("mongoose").Document<unknown, {}, Blog, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    title?: import("mongoose").SchemaDefinitionProperty<string, Blog, import("mongoose").Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    slug?: import("mongoose").SchemaDefinitionProperty<string, Blog, import("mongoose").Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    excerpt?: import("mongoose").SchemaDefinitionProperty<string | undefined, Blog, import("mongoose").Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    content?: import("mongoose").SchemaDefinitionProperty<string, Blog, import("mongoose").Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    featuredImage?: import("mongoose").SchemaDefinitionProperty<MediaAsset | undefined, Blog, import("mongoose").Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    images?: import("mongoose").SchemaDefinitionProperty<MediaAsset[], Blog, import("mongoose").Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    faqs?: import("mongoose").SchemaDefinitionProperty<BlogFaqItem[], Blog, import("mongoose").Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    category?: import("mongoose").SchemaDefinitionProperty<string | undefined, Blog, import("mongoose").Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    tags?: import("mongoose").SchemaDefinitionProperty<string[], Blog, import("mongoose").Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<BlogStatus, Blog, import("mongoose").Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    publishAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Blog, import("mongoose").Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isFeatured?: import("mongoose").SchemaDefinitionProperty<boolean, Blog, import("mongoose").Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    authorName?: import("mongoose").SchemaDefinitionProperty<string | undefined, Blog, import("mongoose").Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    viewCount?: import("mongoose").SchemaDefinitionProperty<number, Blog, import("mongoose").Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Blog, import("mongoose").Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Blog, import("mongoose").Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Blog>;
