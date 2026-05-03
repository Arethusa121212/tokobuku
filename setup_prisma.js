const { execSync } = require('child_process');

try {
  console.log("1. Generating Prisma Client...");
  const out1 = execSync('npx prisma generate', { encoding: 'utf-8', cwd: __dirname });
  console.log(out1);
  
  console.log("2. Pushing DB schema...");
  const out2 = execSync('npx prisma db push --accept-data-loss', { encoding: 'utf-8', cwd: __dirname });
  console.log(out2);
  
  console.log("3. Testing PrismaClient...");
  // Clear require cache to load fresh client
  delete require.cache[require.resolve('@prisma/client')];
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  prisma.book.findMany().then(books => {
    console.log("SUCCESS! Found", books.length, "books.");
    process.exit(0);
  }).catch(err => {
    console.error("Query error:", err.message);
    process.exit(1);
  });
} catch (e) {
  console.error("SETUP ERROR:");
  console.error(e.stdout || e.message);
  console.error(e.stderr);
  process.exit(1);
}
