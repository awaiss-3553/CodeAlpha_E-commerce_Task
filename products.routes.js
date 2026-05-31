import { Router } from "express";
import { prisma } from "../prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const { q = "", category = "", page = "1", limit = "8" } = req.query;

  const where = {
    AND: [
      category ? { category } : {},
      q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }] } : {}
    ]
  };

  const take = Math.max(1, Number(limit));
  const skip = (Math.max(1, Number(page)) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.product.count({ where })
  ]);

  const categories = await prisma.product.findMany({
    distinct: ["category"],
    select: { category: true }
  });

  res.json({ items, total, page: Number(page), limit: take, categories: categories.map(c => c.category) });
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ product });
});

export default router;