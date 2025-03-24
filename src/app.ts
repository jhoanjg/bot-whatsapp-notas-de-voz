import "dotenv/config"
import { createBot, createProvider, createFlow, addKeyword, EVENTS } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot' // Temporarily switch back to MemoryDB
// import { MongoAdapter as Database } from '@builderbot/database-mongo' // Comment out MongoDB for now
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { join } from "path"
import { fromAudioToText } from "./ai/groq"
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import axios from 'axios' // Add axios for HTTP requests
import { fromImageToText } from "./ai/openai";
import { cleanStorage } from './utils/storage-cleaner';

const PORT = process.env.PORT ?? 3008

// Configuración de webhooks para diferentes cuentas
interface WebhookConfig {
  [phoneNumber: string]: string;
}

// Define los números de teléfono y sus webhooks correspondientes
const WEBHOOK_CONFIGS: WebhookConfig = {
  // Puedes agregar tantas cuentas como necesites
}

// Function to send data to webhook
async function sendToWebhook(data: any) {
    try {
        // Determinar qué webhook usar basado en el número de teléfono del remitente
        const phoneNumber = data.from?.split('@')[0];
        const webhookUrl = WEBHOOK_CONFIGS[phoneNumber] || WEBHOOK_CONFIGS['default'];
        
        console.log(`Enviando a webhook para ${phoneNumber}: ${webhookUrl}`);
        const response = await axios.post(webhookUrl, data)
        console.log('Estado de respuesta del webhook:', response.status)
        console.log('Datos de respuesta del webhook:', JSON.stringify(response.data))
        return response.data
    } catch (error) {
        console.error('Error sending to webhook:', error.message)
        // Check if it's a 404 error
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data));
            
            if (error.response.status === 404) {
                console.log('Webhook not found or not registered. Check the webhook URL or test mode.')
                console.log('Hint:', error.response.data?.hint || 'No hint provided')
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received from webhook server');
            console.error('Request details:', error.request._currentUrl || WEBHOOK_URL);
        } else {
            // Something happened in setting up the request
            console.error('Error setting up request:', error.message);
        }
        return null
    }
}

// Helper function to extract clean text from webhook response
function extractResponseText(webhookResponse: any): string | null {
  try {
    // First check if the response is null or undefined
    if (!webhookResponse) {
      console.log('No webhook response to extract text from')
      return null;
    }
    
    // Case 1: Direct response field
    if (webhookResponse.response) {
      return webhookResponse.response;
    }
    
    // Case 2: Array with objects containing output field
    if (Array.isArray(webhookResponse) && webhookResponse.length > 0 && webhookResponse[0].output) {
      return webhookResponse[0].output;
    }
    
    // Case 3: Object with output array
    if (webhookResponse.output) {
      return Array.isArray(webhookResponse.output) 
        ? webhookResponse.output[0] 
        : webhookResponse.output;
    }
    
    // Case 4: String response
    if (typeof webhookResponse === 'string') {
      return webhookResponse;
    }
    
    // Case 5: Common field names
    if (webhookResponse.text || webhookResponse.message) {
      return webhookResponse.text || webhookResponse.message;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting response text:', error);
    return null;
  }
}

// Update both flows to use this helper function

const welcomeFlow = addKeyword<Provider, Database>(EVENTS.WELCOME)
    .addAction(async (ctx, { flowDynamic }) => {
        const message = ctx.body;
        
        // Send the received message to webhook
        const webhookResponse = await sendToWebhook({
            type: 'text',
            from: ctx.from,
            body: message,
            timestamp: new Date().toISOString()
        })
        
        // Extract clean text from response
        const responseText = extractResponseText(webhookResponse);
        
        // Only send a response if we got text from the webhook
        if (responseText) {
            await flowDynamic(responseText);
        }
        // No else clause - don't send any message if no response
    })

const voiceFlow = addKeyword<Provider, Database>(EVENTS.VOICE_NOTE)
    .addAction(async (ctx, { flowDynamic, provider }) => {
        try {
            const storagePath = join(process.cwd(), 'storage');
            
            // Create storage directory if it doesn't exist
            if (!fs.existsSync(storagePath)) {
                fs.mkdirSync(storagePath, { recursive: true });
                console.log(`Created storage directory: ${storagePath}`);
            }

            const ogaFilePath = await provider.saveFile(ctx, {
                path: storagePath
            });

            const wavFilePath = ogaFilePath.replace('.oga', '.wav');

            await new Promise((resolve, reject) => {
                ffmpeg(ogaFilePath)
                    .toFormat('wav')
                    .on('end', resolve)
                    .on('error', reject)
                    .save(wavFilePath);
            });

            console.log('Archivo convertido exitosamente:', wavFilePath);

            const transcription = await fromAudioToText(wavFilePath);
            
            // Send the transcription to webhook
            const webhookResponse = await sendToWebhook({
                type: 'voice_transcription',
                from: ctx.from,
                body: transcription, 
                timestamp: new Date().toISOString()
            })
            
            // Extract clean text from response
            const responseText = extractResponseText(webhookResponse);
            
            // Only send a response if we got text from the webhook
            if (responseText) {
                await flowDynamic(responseText);
            }
            // No else clause - don't send any message if no response

        } catch (error) {
            console.error('Error en el procesamiento de audio:', error);
            // You might want to remove this too if you don't want any error messages
            // await flowDynamic([{ body: 'Lo siento, hubo un error procesando el audio.' }]);
        }
    });

const imageFlow = addKeyword<Provider, Database>(EVENTS.MEDIA)
    .addAction(async (ctx, { flowDynamic, provider }) => {
        try {
            console.log("============ IMAGEN RECIBIDA ============");
            console.log("Contexto completo:", JSON.stringify(ctx, null, 2));
            console.log("Tipo de mensaje:", ctx.type);
            console.log("Estructura del mensaje:", ctx.message);
            console.log("========================================");
            
            // Check if it's an image by examining the message object structure
            if (!ctx.message?.imageMessage) {
                console.log("No es una imagen");
                return;
            }
            
            const storagePath = join(process.cwd(), 'storage');
            
            // Create storage directory if it doesn't exist
            if (!fs.existsSync(storagePath)) {
                fs.mkdirSync(storagePath, { recursive: true });
                console.log(`Created storage directory: ${storagePath}`);
            }

            // Save the image
            const imagePath = await provider.saveFile(ctx, {
                path: storagePath
            });
            
            console.log('Image saved successfully at:', imagePath);
            
            // Verify image file exists and is readable
            if (!fs.existsSync(imagePath)) {
                console.error('Image file does not exist after saving');
                return; // Silent failure - no message sent to user
            }

            const fileStats = fs.statSync(imagePath);
            console.log('Image file size:', fileStats.size, 'bytes');
            
            // Process the image with OpenAI
            console.log('Sending image to OpenAI for processing...');
            const imageDescription = await fromImageToText(imagePath);
            console.log("OpenAI Response:", {
                description: imageDescription,
                length: imageDescription?.length || 0
            });
            
            // Log the data being sent to webhook
            console.log("Sending to webhook:", {
                type: 'image_description',
                from: ctx.from,
                bodyLength: imageDescription?.length || 0,
                bodyPreview: imageDescription?.substring(0, 50) + "..."
            });
            
            // Only proceed if we got a valid description
            if (!imageDescription || imageDescription === "Error al procesar la imagen.") {
                console.log("No valid description received from OpenAI");
                return; // Silent failure - no message sent to user
            }
            
            // Send to webhook
            const webhookResponse = await sendToWebhook({
                type: 'image_description',
                from: ctx.from,
                body: imageDescription, 
                timestamp: new Date().toISOString()
            });
            
            console.log("Webhook response received:", webhookResponse ? "yes" : "no");
            
            // Extract clean text from response
            const responseText = extractResponseText(webhookResponse);
            
            // Only send a response if we got text from the webhook
            if (responseText) {
                await flowDynamic(responseText);
            } else {
                // If no webhook response, send the OpenAI description directly
                await flowDynamic(imageDescription);
            }

        } catch (error) {
            // Log the error but don't send any message to the user
            console.error('Error processing image:', error);
            if (error instanceof Error) {
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack
                });
            }
            // No flowDynamic call here - silent failure
        }
    });

// Update the main function to include the imageFlow
const main = async () => {
    const adapterFlow = createFlow([welcomeFlow, voiceFlow, imageFlow])
    const adapterProvider = createProvider(Provider)
    
    // Use MemoryDB temporarily until MongoDB issues are resolved
    const adapterDB = new Database()
    
    // Comment out MongoDB configuration for now
    /*
    console.log('Intentando conectar a MongoDB:', process.env.MONGODB_URI);
    const adapterDB = new Database({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-bot',
        // More robust connection options
        connectionOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            connectTimeoutMS: 30000,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4,  // Use IPv4, skip trying IPv6
            retryWrites: true,
            w: 'majority'
        }
    })
    
    // Add a delay to ensure MongoDB connection is established
    await new Promise(resolve => setTimeout(resolve, 2000));
    */
    
    // Clean storage on startup
    // Limpia al iniciar
    const storagePath = join(process.cwd(), 'storage');
    cleanStorage(storagePath, 24); // Borra archivos más viejos de 24 horas
    
    // Set up periodic cleaning (every 6 hours)
    // Configura limpieza periódica (cada 6 horas)
    setInterval(() => {
        cleanStorage(storagePath, 24);
    }, 6 * 60 * 60 * 1000);

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    httpServer(+PORT)
}

// Add better error handling for the main function
main().catch(err => {
    console.error('Error en la aplicación principal:', err);
    console.error('Detalles del error:', {
        message: err.message,
        stack: err.stack,
        name: err.name
    });
    process.exit(1);
})
