import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { VyxonqAPI } from "../../src/client/VyxonqClient";

// Modes accepted by this example's third CLI arg:
//   "Minify"   - calls client.apply(code, "Minify"). Strips comments and whitespace for compact output.
//   "Beautify" - calls client.apply(code, "Beautify"). Re-formats code into readable, indented output.
//   "Compress" - calls client.compress(code). Runs the separate VM compression pass (/v1/apply/vm),
//                does not take a mode of its own.
const VALID_MODES = ["Minify", "Beautify", "Compress"] as const;
type Mode = (typeof VALID_MODES)[number];

function isValidMode(value: string): value is Mode {
  return (VALID_MODES as readonly string[]).includes(value);
}

async function main(): Promise<void> {
  const inputFile = process.argv[2];
  const rawMode = process.argv[3] || "Minify";

  if (!inputFile) {
    console.error(`Usage: ts-node example.ts <input.lua> [${VALID_MODES.join("|")}]`);
    process.exit(1);
  }

  if (!isValidMode(rawMode)) {
    console.error(`Invalid mode '${rawMode}'. Expected one of: ${VALID_MODES.join(", ")}`);
    process.exit(1);
  }

  const resolvedInput = path.resolve(inputFile);
  const inputCode = await fs.readFile(resolvedInput, "utf8");

  if (!inputCode.trim()) {
    throw new Error("Input file is empty");
  }

  console.log(`Input size: ${inputCode.length} characters`);
  console.log(`Mode: ${rawMode}`);

  const client = new VyxonqAPI(process.env.VYXONQ_API_URL ?? "https://api.vyxonq.dev");

  const result = rawMode === "Compress"
    ? await client.compress(inputCode)
    : await client.apply(inputCode, rawMode);

  const parsed = path.parse(resolvedInput);
  const uuid = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const outputFile = path.join(parsed.dir, `${uuid}.lua`);

  await fs.writeFile(outputFile, result.code, "utf8");
  const stats = await fs.stat(outputFile);

  console.log(`Saved: ${outputFile}`);
  console.log(`Output size: ${stats.size} bytes`);
  console.log(`Time taken: ${result.duration}ms`);
}

main().catch((e: unknown) => {
  console.error("Error:", e instanceof Error ? e.message : e);
  process.exit(1);
});
