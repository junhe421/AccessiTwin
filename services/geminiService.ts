import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DeviceAnalysis, ControlType, ControlCategory } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    deviceName: { type: Type.STRING, description: "Name of the device (e.g., Samsung Washing Machine or Ibuprofen Bottle)" },
    summary: { type: Type.STRING, description: "Short description of what the device does" },
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
          description: { type: Type.STRING, description: "Location on physical device (e.g. 'Large round dial in center')" },
          category: { 
            type: Type.STRING, 
            enum: [
              ControlCategory.PRIMARY,
              ControlCategory.SECONDARY,
              ControlCategory.ADVANCED,
              ControlCategory.DANGER
            ] 
          },
          detailText: { type: Type.STRING, description: "The full extracted text or detailed instruction optimized for Text-to-Speech. Write this as if speaking to a blind user. Include the action and the result. Example: 'Pressing this starts the Quick Wash cycle which lasts 15 minutes.'" }
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
              
              1. Identify the device or object.
              2. Extract all functional controls or informational sections.
              3. Simplify labels for clarity.
              4. For 'detailText', provide the content ready for Text-to-Speech.
                 - IF BUTTON/KNOB: Describe what happens when used. E.g., "Start Button. Pressing this will begin the standard washing cycle."
                 - IF INSTRUCTION/LABEL: Read the text clearly. E.g., "Dosage Instructions. Take one tablet every 4 hours. Do not exceed 6 tablets."
              5. Categorize controls: 
                 - PRIMARY: The main actions or most critical info.
                 - SECONDARY: Important settings.
                 - ADVANCED: Rare settings.
                 - DANGER: Reset, Delete.
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