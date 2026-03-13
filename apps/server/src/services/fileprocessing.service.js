const fs = require('fs');

async function extractTextFromFile(filePath, mimeType) {
    try {
        if (mimeType === 'application/pdf') {
            const pdfParse = require('pdf-parse');
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            return data.text;
        }

        if (mimeType.includes('word') || filePath.endsWith('.docx')) {
            const mammoth = require('mammoth');
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        }

        if (mimeType.startsWith('text/')) {
            return fs.readFileSync(filePath, 'utf8');
        }

        return ''; // Video files - no text extraction
    } catch (err) {
        console.error('Text extraction failed:', err);
        return '';
    }
}

module.exports = { extractTextFromFile };
