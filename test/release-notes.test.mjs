import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { releaseNotes } from '../scripts/release-notes.mjs';

const script = fileURLToPath(new URL('../scripts/release-notes.mjs', import.meta.url));
const prepare = fileURLToPath(new URL('../scripts/prepare-store-release.py', import.meta.url));
const entry = (version, body = '- Fixed character selection.') => `## [${version}] - 2026-11-06\n\n${body}\n`;

test('release notes select the exact version, excluding unreleased and adjacent versions', () => {
  const markdown = '# Changelog\n\n## [Unreleased]\n\n- Future work.\n\n' +
    entry('1.7.10', '- Newer change.') + '\n' + entry('1.7.1', '### Fixed\n\n- Saved regions load correctly.\n\n[Full diff](https://example.com/diff)') + '\n' + entry('1.7.0', '- Older change.');
  assert.equal(releaseNotes(markdown, '1.7.1'), "## What's changed in v1.7.1\n\n### Fixed\n\n- Saved regions load correctly.\n\n[Full diff](https://example.com/diff)\n");
  assert.equal(releaseNotes(markdown.replaceAll('\n', '\r\n'), '1.7.1'), releaseNotes(markdown, '1.7.1'));
});

test('missing, duplicate and malformed release entries fail instead of using generic notes', () => {
  assert.throws(() => releaseNotes(entry('1.7.1'), '1.7.2'), /Missing/);
  assert.throws(() => releaseNotes(entry('1.7.1') + '\n' + entry('1.7.1'), '1.7.1'), /Duplicate/);
  assert.throws(() => releaseNotes('## [1.7.1]\n\n- Fix.\n', '1.7.1'), /heading/);
  assert.throws(() => releaseNotes(entry('1.7.1').replace('2026-11-06', '2026-02-30'), '1.7.1'), /date/);
  for (const body of ['', '### Fixed', '- TODO', '- TBD', '- Coming soon']) {
    assert.throws(() => releaseNotes(entry('1.7.1', body), '1.7.1'), /completed change notes/);
  }
  for (const version of ['v1.7.1', '1.7.1-beta', '../1.7.1', '']) {
    assert.throws(() => releaseNotes(entry('1.7.1'), version), /numeric/);
  }
});

test('CLI writes the same notes to the release file and Actions summary; failure writes neither', t => {
  const dir = mkdtempSync(join(tmpdir(), 'msfix-release-notes-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const changelog = join(dir, 'CHANGELOG.md'), output = join(dir, 'notes.md'), summary = join(dir, 'summary.md');
  writeFileSync(changelog, entry('1.7.1'));
  writeFileSync(summary, 'Existing summary\n\n');
  const env = { ...process.env, GITHUB_STEP_SUMMARY: summary };
  execFileSync(process.execPath, [script, '1.7.1', output, changelog], { env });
  const notes = readFileSync(output, 'utf8');
  assert.equal(readFileSync(summary, 'utf8'), 'Existing summary\n\n' + notes + '\n');
  const failedOutput = join(dir, 'missing.md');
  const failure = spawnSync(process.execPath, [script, '1.7.2', failedOutput, changelog], { env, encoding: 'utf8' });
  assert.equal(failure.status, 1);
  assert.match(failure.stderr, /Missing CHANGELOG.md entry for 1.7.2/);
  assert.equal(existsSync(failedOutput), false);
  assert.equal(readFileSync(summary, 'utf8'), 'Existing summary\n\n' + notes + '\n');
});

test('marketplace retries use the requested tag notes, with historical backfill only for tags without a changelog', t => {
  const dir = mkdtempSync(join(tmpdir(), 'msfix-tag-notes-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd: dir, stdio: 'pipe' });
  git('init', '-q');
  git('config', 'user.name', 'Release Notes Test');
  git('config', 'user.email', 'test@example.invalid');
  writeFileSync(join(dir, 'README.md'), 'Old release');
  git('add', '.'); git('commit', '-qm', 'Old release'); git('tag', 'v1.0.0');
  writeFileSync(join(dir, 'CHANGELOG.md'), entry('1.1.0', '- Original tagged notes.'));
  git('add', '.'); git('commit', '-qm', 'Tagged notes'); git('tag', 'v1.1.0');
  writeFileSync(join(dir, 'CHANGELOG.md'), entry('1.1.0', '- Later working copy.') + '\n' + entry('1.0.0', '- Historical backfill.'));
  const python = 'import importlib.util,pathlib,sys; spec=importlib.util.spec_from_file_location("prepare",sys.argv[1]); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m); m.prepare_notes(sys.argv[2],sys.argv[3],pathlib.Path.cwd())';
  const run = (tag, version) => execFileSync('python3', ['-c', python, prepare, tag, version], { cwd: dir, env: { ...process.env, GITHUB_STEP_SUMMARY: '' }, stdio: 'pipe' });
  run('v1.1.0', '1.1.0');
  assert.match(readFileSync(join(dir, 'release-notes.txt'), 'utf8'), /Original tagged notes/);
  assert.doesNotMatch(readFileSync(join(dir, 'release-notes.txt'), 'utf8'), /Later working copy/);
  run('v1.0.0', '1.0.0');
  assert.match(readFileSync(join(dir, 'release-notes.txt'), 'utf8'), /Historical backfill/);
  // A tag that already has a changelog must not silently use a different version's current notes.
  assert.throws(() => run('v1.1.0', '1.0.0'));
});

test('the current userscript version has completed tracked release notes', () => {
  const source = readFileSync(new URL('../src/maplescouter-en-fix.user.js', import.meta.url), 'utf8');
  const version = source.match(/^\/\/\s*@version\s+(\S+)\s*$/m)[1];
  const markdown = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
  assert.match(releaseNotes(markdown, version), /^## What's changed in v/);
});
