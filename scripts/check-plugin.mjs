#!/usr/bin/env node

/**
 * DataGrout-specific submission checks that complement validate-template.mjs:
 * mcp.json limited to type + url, ${VAR} declarations, Cursor's schema key
 * whitelists, matching versions, a square logo, and no hooks or scripts shipped
 * inside the plugin.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const pluginDir = path.join(repoRoot, "plugins", "datagrout");
const serverOrigin = "https://gateway.datagrout.ai";
const errors = [];

function addError(message) {
  errors.push(message);
}

async function readJson(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    addError(`${relativePath} is missing or not valid JSON: ${error.message}`);
    return null;
  }
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function checkMcpConfig(mcp, manifest) {
  const server = mcp?.mcpServers?.datagrout;
  if (!server) {
    addError('mcp.json must define the server key "datagrout" (users and allowlists depend on it).');
    return;
  }
  if (typeof server.url !== "string" || !server.url.startsWith(`${serverOrigin}/`)) {
    addError(`mcp.json "datagrout.url" must be an ${serverOrigin}/ URL.`);
  }
  const extraKeys = Object.keys(server).filter((key) => key !== "type" && key !== "url");
  if (extraKeys.length > 0 || server.type !== "http") {
    addError(
      `mcp.json "datagrout" must be exactly {"type": "http", "url"}: DataGrout uses OAuth 2.1 with automatic DCR (found: ${Object.keys(server).join(", ")}).`,
    );
  }

  const declared = new Set(Object.keys(manifest?.variables?.properties ?? {}));
  const used = [...JSON.stringify(mcp).matchAll(/\$\{([^}]+)\}/g)].map((match) => match[1]);
  for (const name of used) {
    if (!declared.has(name)) {
      addError(`mcp.json uses \${${name}} but plugin.json "variables" does not declare it.`);
    }
  }
}

// Key whitelists from cursor/plugins schemas/*.schema.json (additionalProperties: false).
const allowedPluginKeys = new Set([
  "name", "displayName", "description", "version", "minClientVersions", "author", "publisher",
  "homepage", "repository", "license", "logo", "keywords", "category", "tags", "commands",
  "agents", "skills", "rules", "hooks", "variables", "mcpServers",
]);
const allowedEntryKeys = new Set(["name", "source", "description", "minClientVersions"]);

function checkSchemaKeys(manifest, marketplace) {
  for (const key of Object.keys(manifest ?? {})) {
    if (!allowedPluginKeys.has(key)) {
      addError(`plugin.json has "${key}", which Cursor's plugin schema does not allow.`);
    }
  }
  for (const entry of marketplace?.plugins ?? []) {
    for (const key of Object.keys(entry)) {
      if (!allowedEntryKeys.has(key)) {
        addError(`marketplace.json entry "${entry.name}" has "${key}"; Cursor's schema allows only name, source, description, minClientVersions.`);
      }
    }
  }
}

function checkVersions(manifest, marketplace) {
  if (manifest?.version !== marketplace?.metadata?.version) {
    addError(
      `plugin.json version (${manifest?.version}) and marketplace.json metadata.version (${marketplace?.metadata?.version}) must match.`,
    );
  }
}

async function checkLogo(manifest) {
  if (typeof manifest?.logo !== "string" || !/\.(png|svg)$/.test(manifest.logo)) {
    addError('plugin.json "logo" must reference a .png or .svg file.');
    return;
  }
  const logo = await fs.readFile(path.join(pluginDir, manifest.logo)).catch(() => null);
  if (logo === null) {
    return;
  }

  if (manifest.logo.endsWith(".png")) {
    // Width and height are big-endian uint32s in the IHDR chunk at bytes 16-23.
    const isPng = logo.subarray(1, 4).toString("ascii") === "PNG";
    if (!isPng || logo.readUInt32BE(16) !== logo.readUInt32BE(20)) {
      addError(`${manifest.logo} must be a square PNG.`);
    }
    return;
  }

  const svg = logo.toString("utf8");
  const viewBox = svg.match(/viewBox="\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)\s*"/);
  if (!viewBox || viewBox[1] !== viewBox[2]) {
    addError(`${manifest.logo} must have a square viewBox.`);
  }
  if (/<image\b|<script\b|@import|(?:xlink:)?href="(?!#)/i.test(svg)) {
    addError(`${manifest.logo} must be self-contained: no <image>, scripts, imports or external links.`);
  }
}

async function checkNoExecutables() {
  for (const dir of ["hooks", "scripts"]) {
    if (await pathExists(path.join(pluginDir, dir))) {
      addError(`plugins/datagrout/${dir}/ exists; v1 ships no hooks or scripts.`);
    }
  }
}

async function main() {
  const marketplace = await readJson(".cursor-plugin/marketplace.json");
  const manifest = await readJson("plugins/datagrout/.cursor-plugin/plugin.json");
  const mcp = await readJson("plugins/datagrout/mcp.json");

  checkMcpConfig(mcp, manifest);
  checkSchemaKeys(manifest, marketplace);
  checkVersions(manifest, marketplace);
  await checkLogo(manifest);
  await checkNoExecutables();

  if (errors.length > 0) {
    console.error("DataGrout checks failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("DataGrout checks passed.");
}

await main();
