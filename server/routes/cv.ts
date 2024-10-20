import express from "express";
import { s3, uploadPDF } from "../s3uploads";
import Documents from "../models/CV";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

const router = express.Router();

// Upload a PDF document
router.post("/upload", uploadPDF.single("pdf"), async (req, res) => {
  //@ts-ignore
  if (req.file && req.file.location) {
    try {
      //@ts-ignore
      const pdfUrl = req.file.location; // URL from S3
      const description = req.body.description || "";
      const title = req.body.title || "";
      const newDocument = await Documents.create({
        pdfUrl,
        description,
        title,
      });
      res.status(201).json(newDocument);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).send("Error saving document info to database");
    }
  } else {
    res.status(400).send("PDF upload failed");
    console.error("No req.file");
  }
});

// Get all documents
router.get("/", async (req, res) => {
  try {
    const documents = await Documents.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).send("Error fetching documents");
  }
});

// Delete a CV document by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find the document in the database
    const document = await Documents.findByPk(id);

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Extract the S3 key from the document's URL
    const pdfUrl = document.pdfUrl;
    const s3Key = pdfUrl.split(".com/")[1]; // This extracts the key after the S3 domain

    // Delete the file from the S3 bucket
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: s3Key,
    });

    await s3.send(deleteCommand);

    // Delete the document from the database
    await document.destroy();

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).send("Error deleting document");
  }
});

export default router;
