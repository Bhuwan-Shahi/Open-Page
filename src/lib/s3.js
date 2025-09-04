import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadToS3(fileBuffer, fileName, contentType = 'image/jpeg') {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  });

  try {
    await s3Client.send(command);
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

export async function deleteFromS3(fileName) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
  });

  try {
    await s3Client.send(command);
    console.log(`Successfully deleted ${fileName} from S3`);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
}

export function extractS3KeyFromUrl(url) {
  // Extract the S3 key (filename) from the full S3 URL
  const bucketUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
  return url.replace(bucketUrl, '');
}
