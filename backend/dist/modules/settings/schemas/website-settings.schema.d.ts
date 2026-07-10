import { HydratedDocument } from 'mongoose';
import { MediaAsset } from "../../../common/schemas/media-asset.schema";
import { SocialLinks } from "../../../common/schemas/social-links.schema";
export type WebsiteSettingsDocument = HydratedDocument<WebsiteSettings>;
export declare const SETTINGS_SINGLETON_KEY = "global";
declare class ContactInfo {
    phone?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    googleMapEmbedUrl?: string;
}
declare class FooterSettings {
    aboutText?: string;
    copyrightText?: string;
}
export declare enum HomepageHighlightIcon {
    TREE_PINE = "tree-pine",
    RULER = "ruler",
    HAMMER = "hammer",
    TRUCK = "truck",
    SHIELD_CHECK = "shield-check",
    AWARD = "award",
    LEAF = "leaf",
    CLOCK = "clock",
    THUMBS_UP = "thumbs-up",
    PEN_TOOL = "pen-tool",
    PACKAGE = "package",
    USERS = "users"
}
declare class HomepageHighlight {
    icon: HomepageHighlightIcon;
    title: string;
    description: string;
}
declare class HomepageSettings {
    whyWoodivoPoints?: HomepageHighlight[];
}
export declare class WebsiteSettings {
    key: string;
    siteName?: string;
    tagline?: string;
    logo?: MediaAsset;
    favicon?: MediaAsset;
    contact?: ContactInfo;
    socialLinks?: SocialLinks;
    footer?: FooterSettings;
    homepage?: HomepageSettings;
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const WebsiteSettingsSchema: import("mongoose").Schema<WebsiteSettings, import("mongoose").Model<WebsiteSettings, any, any, any, any, any, WebsiteSettings>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, WebsiteSettings, import("mongoose").Document<unknown, {}, WebsiteSettings, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<WebsiteSettings & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    key?: import("mongoose").SchemaDefinitionProperty<string, WebsiteSettings, import("mongoose").Document<unknown, {}, WebsiteSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WebsiteSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    siteName?: import("mongoose").SchemaDefinitionProperty<string | undefined, WebsiteSettings, import("mongoose").Document<unknown, {}, WebsiteSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WebsiteSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    tagline?: import("mongoose").SchemaDefinitionProperty<string | undefined, WebsiteSettings, import("mongoose").Document<unknown, {}, WebsiteSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WebsiteSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    logo?: import("mongoose").SchemaDefinitionProperty<MediaAsset | undefined, WebsiteSettings, import("mongoose").Document<unknown, {}, WebsiteSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WebsiteSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    favicon?: import("mongoose").SchemaDefinitionProperty<MediaAsset | undefined, WebsiteSettings, import("mongoose").Document<unknown, {}, WebsiteSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WebsiteSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    contact?: import("mongoose").SchemaDefinitionProperty<ContactInfo | undefined, WebsiteSettings, import("mongoose").Document<unknown, {}, WebsiteSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WebsiteSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    socialLinks?: import("mongoose").SchemaDefinitionProperty<SocialLinks | undefined, WebsiteSettings, import("mongoose").Document<unknown, {}, WebsiteSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WebsiteSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    footer?: import("mongoose").SchemaDefinitionProperty<FooterSettings | undefined, WebsiteSettings, import("mongoose").Document<unknown, {}, WebsiteSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WebsiteSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    homepage?: import("mongoose").SchemaDefinitionProperty<HomepageSettings | undefined, WebsiteSettings, import("mongoose").Document<unknown, {}, WebsiteSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WebsiteSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    googleAnalyticsId?: import("mongoose").SchemaDefinitionProperty<string | undefined, WebsiteSettings, import("mongoose").Document<unknown, {}, WebsiteSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WebsiteSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    facebookPixelId?: import("mongoose").SchemaDefinitionProperty<string | undefined, WebsiteSettings, import("mongoose").Document<unknown, {}, WebsiteSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WebsiteSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, WebsiteSettings, import("mongoose").Document<unknown, {}, WebsiteSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WebsiteSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, WebsiteSettings, import("mongoose").Document<unknown, {}, WebsiteSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WebsiteSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, WebsiteSettings>;
export {};
