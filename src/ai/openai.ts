import { OpenAI } from "openai";
import fs from "fs";

// Hardcoded API key (for development only)
const OPENAI_API_KEY = "" 

// Initialize the OpenAI client with the explicit API key
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * Función para enviar un mensaje a ChatGPT y obtener una respuesta
 */
export async function toAskChatGPT(message: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "Actua como un traductor, tu proposito es devolverme todo el texto en italiano:" },
        { role: "user", content: message }
      ],
      model: "gpt-4o-mini",
    });

    const italian = completion.choices[0].message.content;
    console.log(`>>>>>>>>>> ${italian}`);
    return italian || "No se pudo traducir el texto.";
  } catch (error) {
    console.error("Error al comunicarse con OpenAI:", error);
    return "Lo siento, hubo un error al procesar tu mensaje.";
  }
}

/**
 * Función para transcribir el contenido de una imagen usando OpenAI Vision
 */
export async function fromImageToText(imagePath: string): Promise<string> {
  try {
    // Read the image file as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Create a chat completion with the image
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe detalladamente lo que ves en esta imagen." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const description = response.choices[0].message.content;
    console.log("Image description:", description);
    return description || "No se pudo describir la imagen.";
  } catch (error) {
    console.error("Error al procesar la imagen con OpenAI:", error);
    return "Error al procesar la imagen.";
  }
}
