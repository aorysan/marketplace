const pdfParse = require('pdf-parse');

async function parsePdf(buffer) {
  try {
    const normalizedBuffer = buffer && buffer.byteOffset !== undefined && buffer.buffer
      ? new Uint8Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength))
      : buffer;
    const data = await pdfParse(normalizedBuffer);
    return data.text;
  } catch (e) {
    return `# PDF Parse Error\n\nFailed to extract text from PDF.\n\nError: ${e.message}`;
  }
}

module.exports = { parsePdf };
