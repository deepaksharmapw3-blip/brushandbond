require("dotenv").config();
const app = require("./src/app");
const prisma = require("./src/config/prisma");

const PORT = process.env.PORT || 5000;

let server;

async function startServer() {
  try {
    // Verify database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connection established successfully with PostgreSQL!");

    server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`  GCECT ART CLUB Backend Server Running!`);
      console.log(`  Port: http://localhost:${PORT}`);
      console.log(`  API Status: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Error: Port ${PORT} is already in use by another process.`);
      } else {
        console.error("Server error:", err);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to connect to database or start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nGracefully shutting down server...");
  if (server) server.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nGracefully shutting down server...");
  if (server) server.close();
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
