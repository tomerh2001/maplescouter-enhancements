#!/usr/bin/env node
// CHANGELOG.md is the source for GitHub Releases, Actions summaries and AMO notes.
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function releaseNotes(markdown, version) {
  if (!/^\d+(?:\.\d+){1,3}$/.test(version)) throw new Error('Expected a numeric extension version');
  markdown = markdown.replace(/\r\n/g, '\n');
  const sections = [...markdown.matchAll(/^## (.+)$/gm)];
  const seen = new Set();
  let selected;
  for (const [index, section] of sections.entries()) {
    const heading = section[1];
    const text = markdown.slice(section.index + section[0].length, sections[index + 1]?.index);
    if (heading === '[Unreleased]') continue;
    const match = heading.match(/^\[(\d+(?:\.\d+){1,3})\] - (\d{4}-\d{2}-\d{2})$/);
    if (!match) throw new Error(`Invalid changelog heading: ${heading}`);
    const [, entryVersion, date] = match;
    if (seen.has(entryVersion)) throw new Error(`Duplicate changelog entry for ${entryVersion}`);
    seen.add(entryVersion);
    const parsed = new Date(`${date}T00:00:00Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
      throw new Error(`Invalid changelog date for ${entryVersion}`);
    }
    const body = text.trim();
    if (!/^- \S/m.test(body) || /\b(?:TBD|TODO|coming soon)\b/i.test(body)) {
      throw new Error(`Changelog entry for ${entryVersion} needs completed change notes`);
    }
    if (entryVersion === version) selected = `## What's changed in v${version}\n\n${body}\n`;
  }
  if (!selected) throw new Error(`Missing CHANGELOG.md entry for ${version}`);
  return selected;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length > 5) throw new Error('Usage: node scripts/release-notes.mjs [version] [output] [changelog]');
    const version = process.argv[2] || readFileSync('src/maplescouter-en-fix.user.js', 'utf8').match(/^\/\/\s*@version\s+(\S+)\s*$/m)?.[1];
    const notes = releaseNotes(readFileSync(process.argv[4] || 'CHANGELOG.md', 'utf8'), version || '');
    if (process.argv[3]) writeFileSync(process.argv[3], notes);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, notes + '\n');
    console.log(notes);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
