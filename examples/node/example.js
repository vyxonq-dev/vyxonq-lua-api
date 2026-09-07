const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

function loadClient() {
  try {
    return require("../../dist/client/VyxonqClient");
  } catch {
    require("ts-node/register");
    return require("../../src/client/VyxonqClient");
  }
}

const { VyxonqAPI } = loadClient();

// Modes accepted by this example's third CLI arg:
//   "Minify"   - calls client.apply(code, "Minify"). Strips comments and whitespace for compact output.
//   "Beautify" - calls client.apply(code, "Beautify"). Re-formats code into readable, indented output.
//   "Compress" - calls client.compress(code). Runs the separate VM compression pass (/v1/apply/vm),
//                does not take a mode of its own.
const VALID_MODES = ["Minify", "Beautify", "Compress"];

(async () => {
  try {
    const inputFile = process.argv[2];
    const mode = process.argv[3] || "Minify";

    if (!inputFile) {
      console.error(`Usage: node example.js <input.lua> [${VALID_MODES.join("|")}]`);
      process.exit(1);
    }

    if (!VALID_MODES.includes(mode)) {
      console.error(`Invalid mode '${mode}'. Expected one of: ${VALID_MODES.join(", ")}`);
      process.exit(1);
    }

    const resolvedInput = path.resolve(inputFile);

    try {
      await fs.access(resolvedInput);
    } catch {
      throw new Error(`File not found: ${resolvedInput}`);
    }

    console.log(`Reading file: ${resolvedInput}`);

    const client = new VyxonqAPI(process.env.VYXONQ_API_URL || "https://api.vyxonq.dev");

    const inputCode = await fs.readFile(resolvedInput, "utf8");

    if (!inputCode.trim()) {
      throw new Error("Input file is empty");
    }

    console.log(`Input size: ${inputCode.length} characters`);
    console.log(`Mode: ${mode}`);

    const result = mode === "Compress"
      ? await client.compress(inputCode)
      : await client.apply(inputCode, mode);

    const parsed = path.parse(resolvedInput);
    const uuid = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const outputFile = path.join(parsed.dir, `${uuid}.lua`);

    await fs.writeFile(outputFile, result.code, "utf8");
    const stats = await fs.stat(outputFile);

    console.log(`Saved: ${outputFile}`);
    console.log(`Output size: ${stats.size} bytes`);
    console.log(`Time taken: ${result.duration}ms`);
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
})();
