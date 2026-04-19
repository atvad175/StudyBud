import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const extractTextFromFile = async (file) => {
    const type = file.type;
    const name = file.name.toLowerCase();

    if (name.endsWith('.pdf') || type === 'application/pdf') {
        return await parsePDF(file);
    } else if (name.endsWith('.docx') || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return await parseDocx(file);
    } else if (type && type.includes('text') || name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.csv')) {
        return await parseText(file);
    } else {
        throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT.');
    }
};

const parseText = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Failed to read text file.'));
        reader.readAsText(file);
    });
};

const parseDocx = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value || '';
    } catch (error) {
        console.error("Docx parse error:", error);
        throw new Error("Failed to parse Word document. Ensure it's not corrupted or password-protected.");
    }
};

const parsePDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        const limit = Math.min(pdf.numPages, 40); // Cap at 40 pages just in case

        for (let i = 1; i <= limit; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map(item => item.str);
            fullText += strings.join(' ') + '\n';
        }
        return fullText;
    } catch (error) {
        console.error("PDF parse error:", error);
        throw new Error("Failed to read PDF. Ensure it's a valid, unencrypted text-based PDF.");
    }
};
