import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword, verifyPassword } from "../lib/auth/password";
import { PrismaClient } from "../generated/prisma/client";

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  const products = await prisma.product.count({ where: { isActive: true } });
  const countries = await prisma.shippingCountry.count({
    where: { isActive: true },
  });
  const user = await prisma.user.findUnique({
    where: { email: "demo@kapriz.test" },
  });

  if (!user) {
    throw new Error("Demo user missing");
  }

  const passwordOk = await verifyPassword("Password123!", user.passwordHash);
  const hash = await hashPassword("Password123!");

  console.log(
    JSON.stringify(
      {
        products,
        countries,
        demoUser: user.email,
        role: user.role,
        passwordOk,
        hashPrefix: hash.slice(0, 10),
      },
      null,
      2,
    ),
  );

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
