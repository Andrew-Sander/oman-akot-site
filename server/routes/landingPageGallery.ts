import express from "express";
import LandingPageGallery from "../models/LandingPageGallery";
import { deleteFromBunny, upload, uploadToBunny } from "../bunnyUploads";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

const router = express.Router();

// Get all images in LandingPageGallery
router.get("/", async (req, res) => {
  try {
    const images = await LandingPageGallery.findAll({
      order: [["order", "ASC"]],
    });
    res.status(200).json(images);
  } catch (error) {
    console.error("Error fetching landing page gallery images:", error);
    res.status(500).send("Error fetching landing page gallery images");
  }
});

// Add a new image to LandingPageGallery
router.post("/", upload.single("image"), async (req, res) => {
  try {
    // Find the current max order to determine the next order value
    const maxOrderImage = await LandingPageGallery.findOne({
      order: [["order", "DESC"]],
    });
    const nextOrder = maxOrderImage ? maxOrderImage.order + 1 : 1;

    //@ts-ignore
    if (req.file) {
      const originalName = req.file.originalname;
      const fileName = `${uuidv4()}-${originalName}`;

      const compressedImage = await sharp(req.file.buffer)
        .webp({ quality: 50 })
        .toBuffer();
      const imageUrl = await uploadToBunny(compressedImage, fileName);

      const newImage = await LandingPageGallery.create({
        imageUrl,
        order: nextOrder,
      });

      res.status(201).json(newImage);
    } else {
      console.error("Image upload failed: no req.file or req.file.location");
      res.status(400).send("Image upload failed");
    }
  } catch (error) {
    console.error("Error uploading image to LandingPageGallery:", error);
    res.status(500).send("Error uploading image to LandingPageGallery");
  }
});

// Update an image's order in LandingPageGallery by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { order } = req.body;

  try {
    const image = await LandingPageGallery.findByPk(id);
    if (!image) {
      return res.status(404).send("Image not found");
    }

    image.order = order;
    await image.save();

    res.status(200).json(image);
  } catch (error) {
    console.error("Error updating landing page gallery image:", error);
    res.status(500).send("Error updating landing page gallery image");
  }
});

// Delete an image from LandingPageGallery by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const image = await LandingPageGallery.findByPk(id);
    if (!image) {
      return res.status(404).send("Image not found");
    }
    const imageUrl = image.imageUrl;
    const fileName = imageUrl.split("/").pop();

    if (fileName) {
      await deleteFromBunny(fileName);
    }

    await image.destroy();
    res.status(200).send("Image deleted successfully");
  } catch (error) {
    console.error("Error deleting landing page gallery image:", error);
    res.status(500).send("Error deleting landing page gallery image");
  }
});

export default router;
