import R2 from "./S3client";

import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function fetchInvoiceFile(
    kvitteringId: string
) {
    try {
        return R2.send(
            new GetObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!!,
                Key: `invoices/${kvitteringId}.html`,
            })
        );
    
    } catch (error) {
        console.error("Error fetching invoice file:", error);
        throw error;
    }
}
