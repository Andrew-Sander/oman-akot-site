import multer from "multer";
import axios from "axios";

// 1. Configure Multer to store files in memory.
const storage = multer.memoryStorage();
export const upload = multer({ storage });

/**
 * Uploads a buffer to Bunny.net storage zone
 * @param fileBuffer - The file content as Buffer
 * @param fileName - The name you want to give the file in Bunny storage
 * @returns - The public CDN URL for accessing the file
 */
export async function uploadToBunny(
  fileBuffer: Buffer,
  fileName: string,
  contentType?: string
): Promise<string> {
  try {
    // The Bunny.net Storage Zone name. This is what you set up in your Bunny.net panel.
    const storageZoneName = process.env.BUNNY_STORAGE_ZONE_NAME;
    // Access key from Bunny.net
    const accessKey = process.env.BUNNY_API_ACCESS_KEY;
    // The base URL for your Storage Zone.
    const bunnyStorageUrl = `https://la.storage.bunnycdn.com/${storageZoneName}/${fileName}`;
    const headers: Record<string, string> = {
      AccessKey: accessKey!,
    };
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    // Make the PUT request to upload the file
    await axios.put(bunnyStorageUrl, fileBuffer, {
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // Construct the final CDN URL (using your Pull Zone domain):
    // Example: https://your-pull-zone.b-cdn.net/filename.jpg
    const cdnDomain = process.env.BUNNY_CDN_DOMAIN;
    const cdnUrl = `https://${cdnDomain}/${fileName}`;

    return cdnUrl;
  } catch (error) {
    console.error("Error uploading to Bunny.net:", error);
    throw error;
  }
}

export async function deleteFromBunny(fileName: string) {
  try {
    const storageZoneName = process.env.BUNNY_STORAGE_ZONE_NAME;
    const accessKey = process.env.BUNNY_API_ACCESS_KEY;
    const bunnyStorageUrl = `https://la.storage.bunnycdn.com/${storageZoneName}/${fileName}`;

    await axios.delete(bunnyStorageUrl, {
      headers: {
        AccessKey: accessKey,
      },
    });
    console.log("File deleted from Bunny.net:", fileName);
  } catch (error) {
    console.error("Error deleting file from Bunny.net:", error);
    throw error;
  }
}

export const uploadPDFBunny = multer({
  storage: multer.memoryStorage(), // Store file in memory as Buffer
});
