import fs from "fs/promises";
import path from "path";
import os from "os";
import { TokenSet } from "xero-node";

const DEFAULT_DIR = path.join(os.homedir(), ".xero-mcp");
const DEFAULT_FILE = "tokens.json";

export class TokenStore {
  private readonly filePath: string;

  constructor(customPath?: string) {
    this.filePath = customPath ?? path.join(DEFAULT_DIR, DEFAULT_FILE);
  }

  async load(): Promise<TokenSet | null> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      const parsed = JSON.parse(data);
      return parsed as TokenSet;
    } catch {
      return null;
    }
  }

  async save(tokenSet: TokenSet): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });

    // Atomic write: write to temp file, then rename
    const tmpPath = this.filePath + ".tmp";
    await fs.writeFile(tmpPath, JSON.stringify(tokenSet, null, 2), "utf-8");
    await fs.rename(tmpPath, this.filePath);
  }

  async clear(): Promise<void> {
    try {
      await fs.unlink(this.filePath);
    } catch {
      // File may not exist, that's fine
    }
  }

  async exists(): Promise<boolean> {
    try {
      await fs.access(this.filePath);
      return true;
    } catch {
      return false;
    }
  }
}
