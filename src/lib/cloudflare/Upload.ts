import {
    PutObjectCommand,
} from "@aws-sdk/client-s3";

import R2 from "./S3client";

interface File {
    name: string;
    buffer: Buffer;
}

export async function uploadFile(
    file: File, 
) {
    return R2.send(
        new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!!,
            Key: file.name,
            Body: file.buffer,
        })
    );
}