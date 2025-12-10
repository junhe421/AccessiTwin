import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DeviceAnalysis, ControlType, ControlCategory } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    deviceName: { type: Type.STRING, description: "Name of the device (e.g., Samsung Washing Machine or Ibuprofen Bottle)" },
    summary: { type: Type.STRING, description: "Short description of what the device does" },
    safetyWarning: { type: Type.STRING, description: "CRITICAL: Any immediate safety risks, heat warnings, or high voltage alerts found on the device." },
    controls: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING, description: "Clear, action-oriented label (e.g. 'Start Wash' or 'Dosage')" },
          type: { 
            type: Type.STRING, 
            enum: [
              ControlType.BUTTON,
              ControlType.KNOB,
              ControlType.SWITCH,
              ControlType.DISPLAY
            ] 
          },
          description: { type: Type.STRING, description: "Precise physical location using CLOCK FACE directions (e.g., 'At 3 o'clock position', 'Center', 'Bottom Left')." },
          category: { 
            type: Type.STRING, 
            enum: [
              ControlCategory.PRIMARY,
              ControlCategory.SECONDARY,
              ControlCategory.ADVANCED,
              ControlCategory.DANGER
            ] 
          },
          detailText: { type: Type.STRING, description: "Detailed content. Use numbered steps for actions, or bullet points for information. Separate lines with \\n." }
        },
        required: ["id", "label", "type", "description", "category", "detailText"]
      }
    }
  },
  required: ["deviceName", "summary", "controls"]
};

export const analyzeDeviceImage = async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<DeviceAnalysis> => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image
              }
            },
            {
              text: `Analyze this image of a physical interface or label. Act as an accessibility expert creating a "Digital Twin" for a visually impaired user. 
              
              1. SAFETY FIRST: Immediately scan for danger symbols, heat warnings, or caution text. Put this in 'safetyWarning'.
              2. Identify the device.
              3. Extract controls. 
                 - Use CLOCK FACE directions for 'description' to help a blind user find the physical button (e.g., "Round button at 2 o'clock").
                 - Simplify labels.
              4. For 'detailText', adapt the format to the control type:
                 - IF it is an actionable control (e.g., button, knob): Provide a numbered list of execution steps (e.g., "1. Press and hold.\n2. Wait for light.").
                 - IF it is informational (e.g., label, screen, ingredients): Use a bulleted list or clear paragraphs.
                 - CRITICAL: Always insert a newline character (\\n) between each step or bullet point.
              5. Categorize controls: 
                 - PRIMARY: Main tasks.
                 - DANGER: Reset, Self-Destruct, or Unsafe buttons.
              6. Return strict JSON.`
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: analysisSchema,
          temperature: 0.1 
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from Gemini");
      
      return JSON.parse(text) as DeviceAnalysis;

    } catch (error) {
      console.error(`Gemini Analysis Error (Attempt ${attempt + 1}/${maxRetries}):`, error);
      attempt++;
      
      if (attempt >= maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
  
  throw new Error("Failed to analyze image after multiple attempts");
};