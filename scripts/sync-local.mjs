#!/usr/bin/env node

/**
 * Copies plugins/datagrout into ~/.cursor/plugins/local/datagrout for local testing.
 * Cursor ignores symlinks that point outside that folder, so this copies instead.
 */

import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const source = path.join(process.cwd(), "plugins", "datagrout");
const target = path.join(os.homedir(), ".cursor", "plugins", "local", "datagrout");

await fs.access(path.join(source, ".cursor-plugin", "plugin.json"));
await fs.rm(target, { recursive: true, force: true });
await fs.mkdir(path.dirname(target), { recursive: true });
await fs.cp(source, target, { recursive: true });

console.log(`Copied ${source} -> ${target}`);
console.log('Now run "Developer: Reload Window" in Cursor (Cmd/Ctrl+Shift+P).');
