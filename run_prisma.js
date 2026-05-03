const { execSync } = require('child_process');

try {
  console.log("Running generate...");
  const out1 = execSync('npx prisma generate', { encoding: 'utf-8', env: { ...process.env, PRISMA_HIDE_UPDATE_MESSAGE: "1", CI: "1" } });
  console.log(out1);
  
  console.log("Running db push...");
  const out2 = execSync('npx prisma db push --accept-data-loss', { encoding: 'utf-8', env: { ...process.env, PRISMA_HIDE_UPDATE_MESSAGE: "1", CI: "1" } });
  console.log(out2);
} catch (e) {
  console.error("ERROR:");
  console.error(e.stdout);
  console.error(e.stderr);
}
