import fs from "fs";
import Groq from "groq-sdk";

// Hardcoded API key (for development only)
const GROQ_API_KEY = "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";

// Initialize the Groq client with the explicit API key
const groq = new Groq({
    apiKey: GROQ_API_KEY
});

export async function fromAudioToText(filePath: string) {
    try {
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-large-v3",
            response_format: "verbose_json",
        });
        console.log(transcription.text);
        return transcription.text;
    } catch (error) {
        console.error("Error en la transcripción de audio:", error);
        return "Error en la transcripción de audio.";
    }
}

