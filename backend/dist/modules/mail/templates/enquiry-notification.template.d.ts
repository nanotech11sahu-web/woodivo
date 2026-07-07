export interface EnquiryNotificationData {
    fullName: string;
    mobileNumber: string;
    city?: string;
    categoryName?: string;
    message?: string;
    source: string;
    submittedAt: Date;
}
export declare function buildEnquiryNotificationEmail(data: EnquiryNotificationData): {
    subject: string;
    html: string;
};
