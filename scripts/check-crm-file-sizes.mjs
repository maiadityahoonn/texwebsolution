import fs from "fs";
import path from "path";

const MAX_BYTES = 30 * 1024; // 30 KB strict limit
const WARN_BYTES = 25 * 1024; // 25 KB ideal upper bound

const DIRS_TO_CHECK = [
  path.join(process.cwd(), "src", "components", "crm"),
  path.join(process.cwd(), "src", "services", "crm"),
  path.join(process.cwd(), "src", "app", "(crm)"),
];

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

console.log("🔍 Checking CRM file sizes against 30KB limit...\n");

let failed = false;
let warnings = [];
const cwd = process.cwd();

const allFiles = DIRS_TO_CHECK.flatMap((dir) => getAllFiles(dir));

for (const filePath of allFiles) {
  const stats = fs.statSync(filePath);
  const relPath = path.relative(cwd, filePath).replace(/\\/g, "/");
  const sizeKb = (stats.size / 1024).toFixed(2);

  if (stats.size > MAX_BYTES) {
    console.error(`❌ [OVER LIMIT] ${relPath}: ${sizeKb} KB (Max allowed is 30.00 KB)`);
    failed = true;
  } else if (stats.size > WARN_BYTES) {
    warnings.push(`⚠️  [WARNING] ${relPath}: ${sizeKb} KB (Approaching 25KB, consider splitting)`);
  }
}

if (warnings.length > 0) {
  console.log("Warnings (Files approaching 25KB):");
  warnings.forEach((w) => console.log(w));
  console.log("");
}

if (failed) {
  console.error("💥 FAILED: One or more CRM files exceeded the strict 30KB limit! Please split them into focused components/hooks.");
  process.exit(1);
} else {
  console.log(`✅ All ${allFiles.length} CRM files are well within the 30KB limit! Everything is clean and properly modularized.`);
}
