import express from "express";
import Documents from "../models/CV";
import { deleteFromBunny, upload, uploadToBunny } from "../bunnyUploads";

const router = express.Router();

// Upload a PDF document
router.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    // Construct a file name (similar to your S3 logic)
    const fileName = Date.now().toString() + "_" + req.file.originalname;

    // The file buffer and MIME type from Multer
    const fileBuffer = req.file.buffer;
    const contentType = req.file.mimetype;

    // Upload to Bunny.net
    const bunnyUrl = await uploadToBunny(fileBuffer, fileName, contentType);

    const description = req.body.description || "";
    const title = req.body.title || "";
    await Documents.create({
      pdfUrl: bunnyUrl,
      description,
      title,
    });
    // Save bunnyUrl to your DB or return it to the client
    return res.status(200).json({
      message: "PDF uploaded successfully!",
      url: bunnyUrl,
    });
  } catch (err) {
    console.error("Error uploading PDF:", err);
    res.status(500).send("Error uploading PDF");
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

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Find the document in the database
    const document = await Documents.findByPk(id);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // 2. Extract the URL you stored in your DB
    const pdfUrl = document.pdfUrl;
    if (!pdfUrl) {
      await document.destroy();
      return res
        .status(200)
        .json({ message: "Document deleted, no file to remove" });
    }

    // 3. Parse the correct path to delete from Bunny Storage
    const pathSegments = pdfUrl.split("/");
    const fileNameOrPath = pathSegments.slice(3).join("/");

    // 4. Delete from Bunny
    await deleteFromBunny(fileNameOrPath);

    // 5. Delete DB record
    await document.destroy();

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).send("Error deleting document");
  }
});

export default router;
