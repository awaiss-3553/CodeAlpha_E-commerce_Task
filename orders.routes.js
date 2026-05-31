import { Router } from "express";
import { prisma } from "../prisma.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.post("/", authRequired, async (req, res) => {
  const userId = req.user.id;

  const cart = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true }
  });

  if (cart.length === 0) return res.status(400).json({ message: "Cart is empty" });

  // stock check
  for (const ci of cart) {
    if (ci.product.stock < ci.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${ci.product.title}` });
    }
  }

  const items = cart.map(ci => ({
    productId: ci.productId,
    quantity: ci.quantity,
    unitPrice: ci.product.price
  }));

  const totalAmount = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);

  const order = await prisma.$transaction(async (tx) => {
    // decrement stock
    for (const ci of cart) {
      await tx.product.update({
        where: { id: ci.productId },
        data: { stock: { decrement: ci.quantity } }
      });
    }

    // create order
    const created = await tx.order.create({
      data: {
        userId,
        status: "PAID",
        totalAmount,
        items: { create: items }
      },
      include: { items: { include: { product: true } } }
    });

    // clear cart
    await tx.cartItem.deleteMany({ where: { userId } });

    return created;
  });

  res.status(201).json({ order });
});

router.get("/my", authRequired, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } }
  });
  res.json({ orders });
});

router.get("/:id", authRequired, async (req, res) => {
  const id = Number(req.params.id);
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } }
  });
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.userId !== req.user.id) return res.status(403).json({ message: "Forbidden" });
  res.json({ order });
});

export default router;