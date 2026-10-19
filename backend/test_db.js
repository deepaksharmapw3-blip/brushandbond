const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const members = await prisma.members.findMany();
  console.log("Database connected successfully!");
  console.log("Members:", members);
}

main()
  .catch((error) => {
    console.error("Database connection failed:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });