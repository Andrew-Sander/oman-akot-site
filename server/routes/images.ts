import express, { Request, Response } from "express";
import Gallery from "../models/Gallery";
const router = express.Router();
interface ReorderRequestBody {
  reorderedIds: number[];
}

router.put(
  "/reorder",
  async (req: Request<{}, {}, ReorderRequestBody>, res: Response) => {
    const { reorderedIds } = req.body;

    try {
      const updatePromises = reorderedIds.map((id, index) => {
        return Gallery.update({ order: index + 1 }, { where: { id } });
      });

      await Promise.all(updatePromises);

      res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  }
);

export default router;
