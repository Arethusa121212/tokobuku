const { execSync } = require('child_process');

try {
  console.log("1. Generating Prisma Client for PostgreSQL...");
  const out1 = execSync('npx prisma generate', { encoding: 'utf-8', cwd: __dirname });
  console.log(out1);
  
  console.log("2. Pushing schema to Neon PostgreSQL...");
  const out2 = execSync('npx prisma db push --accept-data-loss', { encoding: 'utf-8', cwd: __dirname });
  console.log(out2);

  console.log("3. Testing connection...");
  delete require.cache[require.resolve('@prisma/client')];
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  prisma.user.findMany().then(users => {
    console.log("SUCCESS! Connected to Neon. Found", users.length, "users.");
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
