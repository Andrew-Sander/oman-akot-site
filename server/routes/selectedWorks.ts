import express, { Request, Response } from "express";
import SelectedWorks from "../models/SelectedWorks";
import { upload } from "../s3uploads";

const router = express.Router();
interface ReorderRequestBody {
  reorderedIds: number[];
}

// Get all selected works
router.get("/", async (req, res) => {
  try {
    const works = await SelectedWorks.findAll({ order: [["order", "ASC"]] });
    res.status(200).json(works);
  } catch (error) {
    console.error("Error fetching selected works:", error);
    res.status(500).send("Error fetching selected works");
  }
});

// Get selected works by selectedSeriesId
router.get("/series/:selectedSeriesId", async (req, res) => {
  const { selectedSeriesId } = req.params;
  try {
    const works = await SelectedWorks.findAll({
      where: { selectedSeriesId },
      order: [["order", "ASC"]],
    });
    res.status(200).json(works);
  } catch (error) {
    console.error("Error fetching selected works:", error);
    res.status(500).send("Error fetching selected works");
  }
});

// Get a single selected work by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const work = await SelectedWorks.findByPk(id);
    if (work) {
      res.status(200).json(work);
    } else {
      res.status(404).send("Selected work not found");
    }
  } catch (error) {
    console.error("Error fetching selected work:", error);
    res.status(500).send("Error fetching selected work");
  }
});

// Create a new selected work
router.post("/", async (req, res) => {
  const { title, description, imageUrl, order, selectedSeriesId } = req.body;
  try {
    const newWork = await SelectedWorks.create({
      title,
      description,
      imageUrl,
      order,
      selectedSeriesId,
    });
    res.status(201).json(newWork);
  } catch (error) {
    console.error("Error creating selected work:", error);
    res.status(500).send("Error creating selected work");
  }
});

router.put(
  "/reorder",
  async (req: Request<{}, {}, ReorderRequestBody>, res: Response) => {
    const { reorderedIds } = req.body;

    if (!reorderedIds || !Array.isArray(reorderedIds)) {
      return res.status(400).json({ error: "Invalid reorderedIds format" });
    }

    try {
      const updatePromises = reorderedIds.map((id, index) => {
        if (typeof id !== "number") {
          throw new Error("Invalid ID format");
        }
        return SelectedWorks.update({ order: index + 1 }, { where: { id } });
      });

      await Promise.all(updatePromises);

      res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  }
);

// Update a selected work by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, imageUrl } = req.body;

  try {
    const work = await SelectedWorks.findByPk(id);
    if (!work) {
      return res.status(404).send("Selected work not found");
    }

    work.title = title;
    work.description = description;
    work.imageUrl = imageUrl;
    await work.save();

    res.status(200).json(work);
  } catch (error) {
    console.error("Error updating selected work:", error);
    res.status(500).send("Error updating selected work");
  }
});

// Delete a selected work by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const work = await SelectedWorks.findByPk(id);
    if (!work) {
      return res.status(404).send("Selected work not found");
    }

    await work.destroy();
    res.status(200).send("Selected work deleted successfully");
  } catch (error) {
    console.error("Error deleting selected work:", error);
    res.status(500).send("Error deleting selected work");
  }
});

// Upload a selected work
router.post("/upload", upload.single("image"), async (req, res) => {
  const maxOrderWork = await SelectedWorks.findOne({
    order: [["order", "DESC"]],
  });
  const nextOrder = maxOrderWork ? maxOrderWork.order + 1 : 1;

  //@ts-ignore
  if (req.file && req.file.location) {
    try {
      //@ts-ignore
      const imageUrl = req.file.location; // URL from S3
      const description = req.body.description || "";
      const title = req.body.title || "";
      const selectedSeriesId = req.body.selectedSeriesId;
      const newWork = await SelectedWorks.create({
        imageUrl,
        description,
        title,
        order: nextOrder,
        selectedSeriesId,
      });
      res.status(201).json(newWork);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).send("Error saving selected work info to database");
    }
  } else {
    res.status(400).send("Image upload failed");
    console.error("no req.file");
  }
});

export default router;
