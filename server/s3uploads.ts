import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import * as dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: "ca-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME!,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "_" + file.originalname);
    },
  }),
});

const uploadPDF = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME!,
    contentType: function (req, file, cb) {
      cb(null, file.mimetype); // Set the correct Content-Type
    },
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "_" + file.originalname);
    },
  }),
});

export { upload, uploadPDF, s3 };
