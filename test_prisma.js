const { PrismaClient } = require('@prisma/client');

try {
  const prisma = new PrismaClient({
    datasourceUrl: "file:./dev.db"
  });
  console.log("Success!");
} catch (e) {
  console.error("ERROR:");
  console.error(e);
}
