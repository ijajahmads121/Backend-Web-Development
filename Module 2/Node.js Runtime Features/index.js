/**
 * Node.js Runtime Features — Streams, Buffers & the File System
 *
 * GOAL
 * Move the SAME file two different ways and feel the difference:
 * 1) Load the whole file into memory with fs.readFile, and log its size.
 * 2) Flow the file through a stream and pipe it to a writable stream (a copy).
 *
 * Then explain why the stream approach is preferable for large files.
 */

const fs = require('fs');
const path = require('path');

// Absolute, OS-safe paths
const INPUT = path.join(__dirname, 'sample-data.txt');
const OUTPUT = path.join(__dirname, 'sample-copy.txt');

// ── PART 1: Read the whole file into memory ────────────────────────────────
function readWholeFile() {
  fs.readFile(INPUT, (err, data) => {
    if (err) {
      console.error(err.message);
      return;
    }

    console.log(`readFile: loaded ${data.length} bytes into memory`);
  });
}

// ── PART 2: Stream the file and pipe it to a writable stream ───────────────
function streamFile() {
  const readable = fs.createReadStream(INPUT);
  const writable = fs.createWriteStream(OUTPUT);

  readable.on('error', (err) => {
    console.error(err.message);
  });

  writable.on('error', (err) => {
    console.error(err.message);
  });

  readable.pipe(writable);

  writable.on('finish', () => {
    console.log('stream: finished copying via 64KB chunks (flat memory)');
  });
}

// ── PART 3: Explain the difference ────────────────────────────────────────
/*
fs.readFile loads the entire file into memory at once, so memory usage
increases with the size of the file. A stream moves the file in small
chunks, so it does not need to hold the whole file in memory and keeps
peak memory much lower even for very large files.
*/

// Run both approaches
readWholeFile();
streamFile();

module.exports = {
  readWholeFile,
  streamFile,
  INPUT,
  OUTPUT
};