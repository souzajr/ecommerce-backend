import AWS from 'aws-sdk';
import mime from 'mime-types';
import crypto from 'crypto';
import { validateFileFormat, validateSize } from './validation';

export const remove = async (file: string): Promise<void> => {
  if (file) {
    const key = file.split(`${process.env.DIGITAL_OCEAN_URL}/`)[1];

    const spaces = new AWS.S3({
      endpoint: process.env.DIGITAL_OCEAN_ENDPOINT,
      accessKeyId: process.env.DIGITAL_OCEAN_IAM_USER_KEY,
      secretAccessKey: process.env.DIGITAL_OCEAN_IAM_USER_SECRET,
    });

    await spaces
      .deleteObject({
        Bucket: process.env.DIGITAL_OCEAN_BUCKET_NAME,
        Key: key,
      })
      .promise();
  }
};

export const removeWithKey = async (key: string): Promise<void> => {
  if (key) {
    const spaces = new AWS.S3({
      endpoint: process.env.DIGITAL_OCEAN_ENDPOINT,
      accessKeyId: process.env.DIGITAL_OCEAN_IAM_USER_KEY,
      secretAccessKey: process.env.DIGITAL_OCEAN_IAM_USER_SECRET,
    });

    await spaces
      .deleteObject({
        Bucket: process.env.DIGITAL_OCEAN_BUCKET_NAME,
        Key: key,
      })
      .promise();
  }
};

export const presignedUrlUpload = async (
  typeFile: 'file' | 'image',
  file: string,
  size: number,
  permission: 'public-read' | 'private'
): Promise<{
  signedUrl: string;
  key: string;
  contentType: string;
  publicUrl: string;
} | null> => {
  try {
    const checkSize = validateSize(size, typeFile);
    const checkFormat = validateFileFormat(file, typeFile);

    if (!checkSize || !checkFormat) {
      return null;
    }

    const spaces = new AWS.S3({
      endpoint: process.env.DIGITAL_OCEAN_ENDPOINT,
      accessKeyId: process.env.DIGITAL_OCEAN_IAM_USER_KEY,
      secretAccessKey: process.env.DIGITAL_OCEAN_IAM_USER_SECRET,
    });

    const key = crypto.randomBytes(10).toString('hex');

    const typeSplited = file.split('.');

    const type = typeSplited[typeSplited.length - 1];

    const name = `${key}.${type}`;

    const contentType = mime.lookup(name) as string;

    const params = {
      Bucket: process.env.DIGITAL_OCEAN_BUCKET_NAME,
      Key: name,
      Expires: 60, // Expires in 1 minute
      ContentType: contentType,
      ACL: permission,
    };

    const signedUrl = await spaces.getSignedUrlPromise('putObject', params);

    return {
      signedUrl,
      contentType,
      key: name,
      publicUrl: `${process.env.DIGITAL_OCEAN_URL}/${name}`,
    };
  } catch {
    return null;
  }
};

export const presignedUrlDownload = async (
  key: string
): Promise<string | null> => {
  try {
    const spaces = new AWS.S3({
      endpoint: process.env.DIGITAL_OCEAN_ENDPOINT,
      accessKeyId: process.env.DIGITAL_OCEAN_IAM_USER_KEY,
      secretAccessKey: process.env.DIGITAL_OCEAN_IAM_USER_SECRET,
    });

    const params = {
      Bucket: process.env.DIGITAL_OCEAN_BUCKET_NAME,
      Key: key,
      Expires: 5, // Expires in 5 seconds
    };

    const signedUrl = await spaces.getSignedUrlPromise('getObject', params);

    return signedUrl;
  } catch {
    return null;
  }
};
