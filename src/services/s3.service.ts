import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { S3SignedUrl } from '../dto/response/s3-signed-url';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Config } from '../dto/data/s3-config';
import { plainToInstance } from 'class-transformer';

export class S3Service {
    protected s3Client: S3Client;

    constructor(private readonly config: S3Config = null) {
        this.s3Client = new S3Client(config);
    }

    getUrl(bucket: string, key: string): string {
        return "https://" + bucket + ".s3.amazonaws.com/" + key;
    }

    async getSignedUrl(bucket: string, key: string, contentType: string, expiresIn: number): Promise<S3SignedUrl> {
        const bucketParams = {
            Bucket: bucket,
            Key: key,
            ContentType: contentType,
        };

        const command = new PutObjectCommand(bucketParams);
        const signedUrl = await getSignedUrl(this.s3Client, command, {
            expiresIn: expiresIn,
        });

        return plainToInstance(S3SignedUrl, {
            key: key,
            signedUrl: signedUrl,
            futureUrl: this.getUrl(bucket, key)
        });
    }

    async deleteObject(bucket: string, key: string) {
        // Configura y ejecuta el comando para eliminar el archivo
        const deleteObjectCommand = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        try {
            await this.s3Client.send(deleteObjectCommand);
            console.log(`Object ${key} deleted successfully.`);

        }
        catch (err) {
            console.error(`Error deleting object ${key}:`, err);

        }
    }
}
