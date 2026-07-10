export interface EnquiryNotificationData {
    fullName: string;
    mobileNumber: string;
    state?: string;
    city?: string;
    categoryName?: string;
    productName?: string;
    referenceImageCount?: number;
    message?: string;
    source: string;
    submittedAt: Date;
}
export declare function buildEnquiryNotificationEmail(data: EnquiryNotificationData): {
    subject: string;
    html: string;
};
