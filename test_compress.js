const fs = require('fs');
const path = require('path');
const { compressPDF } = require('./server/services/pdfService');

async function test() {
  try {
    const dummyPdfPath = path.join(__dirname, 'server/test/dummy.pdf');
    // If dummy doesn't exist, create an empty one or use pdf-lib to generate one
    if (!fs.existsSync(dummyPdfPath)) {
        const { PDFDocument } = require('pdf-lib');
        const doc = await PDFDocument.create();
        const page = doc.addPage([600, 400]);
        page.drawText('Test', { x: 50, y: 350 });
        const bytes = await doc.save();
        fs.writeFileSync(dummyPdfPath, bytes);
    }
    
    console.log('Testing compressPDF...');
    await compressPDF(dummyPdfPath);
    console.log('Success');
  } catch (err) {
    console.error('Error in compressPDF:', err.message);
    if (err.stack) console.error(err.stack);
  }
}

test();
