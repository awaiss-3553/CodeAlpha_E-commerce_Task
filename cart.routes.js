import { Router } from "express";
import { prisma } from "../prisma.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, async (req, res) => {
  const cart = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: { product: true }
  });
  res.json({ cart });
});

router.post("/add", authRequired, async (req, res) => {
  const { productId, quantity = 1 } = req.body || {};
  const pid = Number(productId);
  const qty = Math.max(1, Number(quantity));

  const product = await prisma.product.findUnique({ where: { id: pid } });
  if (!product) return res.status(404).json({ message: "Product not found" });

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: req.user.id, productId: pid } }
  });

  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + qty },
      include: { product: true }
    });
    return res.json({ item: updated });
  }

  const created = await prisma.cartItem.create({
    data: { userId: req.user.id, productId: pid, quantity: qty },
    include: { product: true }
  });

  res.status(201).json({ item: created });
});

router.post("/update", authRequired, async (req, res) => {
  const { productId, quantity } = req.body || {};
  const pid = Number(productId);
  const qty = Math.max(0, Number(quantity));

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: req.user.id, productId: pid } }
  });
  if (!existing) return res.status(404).json({ message: "Cart item not found" });

  if (qty === 0) {
    await prisma.cartItem.delete({ where: { id: existing.id } });
    return res.json({ removed: true });
  }

  const updated = await prisma.cartItem.update({
    where: { id: existing.id },
    data: { quantity: qty },
    include: { product: true }
  });

  res.json({ item: updated });
});

router.post("/clear", authRequired, async (req, res) => {
  await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
  res.json({ cleared: true });
});

export default router;