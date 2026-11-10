import "server-only";

import { randomBytes } from "node:crypto";
import { badRequest, notFound } from "@/lib/api/errors";
import { toNumber } from "@/lib/mappers/product";
import { prisma } from "@/lib/prisma";

function createOrderNumber() {
  return `KAP-${new Date().getUTCFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function listOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
      shippingAddress: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderForUser(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: true,
      shippingAddress: true,
    },
  });
  if (!order) throw notFound("Order not found");
  return order;
}

export async function createOrderFromCart(
  userId: string,
  shippingAddressId: string,
) {
  return prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({
      where: { id: shippingAddressId, userId },
    });
    if (!address) {
      throw notFound("Shipping address not found");
    }

    const shippingCountry = await tx.shippingCountry.findUnique({
      where: { code: address.country.toUpperCase() },
    });
    if (!shippingCountry || !shippingCountry.isActive) {
      throw badRequest("Shipping is not available for this address country");
    }
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw notFound("User not found");

    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                color: true,
                product: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw badRequest("Cart is empty");
    }

    let subtotal = 0;
    const orderItemsData: Array<{
      productId: string;
      variantId: string;
      sku: string;
      productName: string;
      colorName: string;
      size: number;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> = [];

    for (const item of cart.items) {
      const variant = item.variant;
      if (!variant.isActive || !variant.product.isActive) {
        throw badRequest(`Variant ${variant.sku} is unavailable`);
      }
      if (variant.stock < item.quantity) {
        throw badRequest(`Insufficient stock for ${variant.product.name}`);
      }

      const unitPrice = variant.priceOverride
        ? toNumber(variant.priceOverride)
        : toNumber(variant.product.price);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItemsData.push({
        productId: variant.productId,
        variantId: variant.id,
        sku: variant.sku,
        productName: variant.product.name,
        colorName: variant.color.name,
        size: variant.size,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    const shippingCost = toNumber(shippingCountry.shippingPrice);
    const total = subtotal + shippingCost;

    const order = await tx.order.create({
      data: {
        orderNumber: createOrderNumber(),
        userId,
        customerEmail: user.email,
        customerFirstName: user.firstName,
        customerLastName: user.lastName,
        customerPhone: address.phone,
        status: "PENDING",
        paymentStatus: "UNPAID",
        subtotal,
        shippingCost,
        total,
        currency: "USD",
        shippingAddressId: address.id,
        shippingFirstName: address.firstName,
        shippingLastName: address.lastName,
        shippingCountry: address.country,
        shippingCity: address.city,
        shippingAddressLine1: address.addressLine1,
        shippingAddressLine2: address.addressLine2 ?? "",
        shippingPostalCode: address.postalCode,
        shippingPhone: address.phone,
        shippingCountryCode: shippingCountry.code,
        shippingCountryName: shippingCountry.name,
        shippingMethodName: "standard",
        shippingEstimatedMinDays: shippingCountry.estimatedMinDays,
        shippingEstimatedMaxDays: shippingCountry.estimatedMaxDays,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
        shippingAddress: true,
      },
    });

    // UNPAID orders must not alter inventory; payment finalisation owns stock decrement.
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  });
}
