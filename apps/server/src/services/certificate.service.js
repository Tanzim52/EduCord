const Certificate = require('../models/Certificate');
const Course = require('../models/Course');

const fs = require('fs');
const path = require('path');

exports.generateCertificate = async (userId, courseId, userName, courseName) => {
    try {
        const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // In a real app, you'd use a robust PDF generator or HTML-to-PDF
        // For this demo, we'll create a simple text-based PDF or potentially use a template
        // We'll simulate PDF generation by creating a text file for now to avoid heavy dependencies like puppeteer in this environment
        // OR we can use PDFKit if available. Let's assume a simple placeholder generation logic.

        // Placeholder: Generate a simple JSON/Text "Certificate"
        const fileName = `certificate-${certificateId}.txt`;
        const filePath = path.join(__dirname, '../../uploads', fileName);

        const content = `
            CERTIFICATE OF COMPLETION
            -------------------------
            This certifies that
            ${userName}
            
            Has successfully completed the course
            ${courseName}
            
            Certificate ID: ${certificateId}
            Date: ${new Date().toLocaleDateString()}
        `;

        fs.writeFileSync(filePath, content);

        const certificate = await Certificate.create({
            user: userId,
            course: courseId,
            certificateId,
            pdfUrl: `/uploads/${fileName}`
        });

        return certificate;
    } catch (err) {
        console.error('Certificate generation failed:', err);
        throw err;
    }
};
