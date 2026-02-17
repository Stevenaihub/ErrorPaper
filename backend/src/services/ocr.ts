// ocr.ts

// OCR Service

import Tesseract from 'tesseract.js';

export default class OCRService {
    static async recognizeText(imagePath: string): Promise<string> {
        try {
            const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', { logger: info => console.log(info) });
            return text;
        } catch (error) {
            console.error('Error recognizing text:', error);
            throw error;
        }
    }
}
