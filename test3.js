const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

(async () => {
  try {
    const libsql = createClient({
      url: "file:./dev.db",
    });
    const adapter = new PrismaLibSql(libsql);
    const prisma = new PrismaClient({ adapter });
    console.log("Success with adapter!");
    
    const books = await prisma.book.findMany();
    console.log("Found books:", books.length);
  } catch (e) {
    console.error("ERROR:");
    console.error(e);
  }
})();
