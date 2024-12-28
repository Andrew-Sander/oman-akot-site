// routes/selectedSeries.ts
import express from "express";
import { SelectedSeries } from "../models/associationshit";
import { SelectedWorks } from "../models/associationshit";
import { deleteFromBunny, upload, uploadToBunny } from "../bunnyUploads";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

const router = express.Router();

// Get all selected series
router.get("/", async (req, res) => {
  try {
    const series = await SelectedSeries.findAll({
      include: [
        {
          model: SelectedWorks,
          as: "selectedWorks",
        },
      ],
    });
    res.status(200).json(series);
  } catch (error) {
    console.error("Error fetching selected series:", error);
    res.status(500).send("Error fetching selected series");
  }
});

// Get a selected series by id, including its works
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const series = await SelectedSeries.findByPk(id, {
      include: [
        {
          model: SelectedWorks,
          as: "selectedWorks",
        },
      ],
    });
    if (series) {
      res.status(200).json(series);
    } else {
      res.status(404).send("Selected series not found");
    }
  } catch (error) {
    console.error("Error fetching selected series:", error);
    res.status(500).send("Error fetching selected series");
  }
});

// Create a new selected series
router.post("/", upload.single("image"), async (req, res) => {
  const { name } = req.body;
  //@ts-ignore
  const imageUrl = req.file ? req.file.location : null;

  try {
    const newSeries = await SelectedSeries.create({ imageUrl, name });
    res.status(201).json(newSeries);
  } catch (error) {
    console.error("Error creating selected series:", error);
    res.status(500).send("Error creating selected series");
  }
});

// Update a selected series
router.put("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (req.file) {
    const originalName = req.file.originalname;
    const fileName = `${uuidv4()}-${originalName}`;
    const compressedImage = await sharp(req.file.buffer)
      .webp({ quality: 50 })
      .toBuffer();
    // 2. Upload to Bunny
    const imageUrl = await uploadToBunny(compressedImage, fileName);

    try {
      const series = await SelectedSeries.findByPk(id);
      if (!series) {
        return res.status(404).send("Selected series not found");
      }

      if (imageUrl) {
        series.imageUrl = imageUrl;
      }
      if (name) {
        series.name = name;
      }
      await series.save();

      res.status(200).json(series);
    } catch (error) {
      console.error("Error updating selected series:", error);
      res.status(500).send("Error updating selected series");
    }
  }
});

// Delete a selected series
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const series = await SelectedSeries.findByPk(id);
    if (!series) {
      return res.status(404).send("Selected series not found");
    }
    const imageUrl = series.imageUrl;
    const fileName = imageUrl.split("/").pop();

    if (fileName) {
      await deleteFromBunny(fileName);
    }

    await series.destroy();
    res.status(200).send("Selected series deleted successfully");
  } catch (error) {
    console.error("Error deleting selected series:", error);
    res.status(500).send("Error deleting selected series");
  }
});

export default router;
