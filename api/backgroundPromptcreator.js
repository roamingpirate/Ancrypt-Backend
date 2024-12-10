import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();
  
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const restrictedKeywords = [
  "child", "celebrity", "dangerous content", "hate", "people","face", 
  "personal information", "prohibited content", "sexual", "toxic", 
  "violence", "vulgar"
];

function filterRestrictedKeywords(text) {
  let filteredText = text;
  restrictedKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    filteredText = filteredText.replace(regex, '[RESTRICTED]');
  });
  return filteredText;
}

async function getGeneratedBackgroundImagePrompt(prompt) {
  const parts = [
    {text: "Your task is to create a 3D style background image prompt from the input I provide. It should evoke a scenic sense of background and should not focus on objects, people, or text. The prompt should strictly exclude the following words: child, celebrity, dangerous content, hate, people/face, personal information, prohibited content, sexual, toxic, violence, and vulgar."},
    {text: "input: A lively kitchen scene with Bob and Pam chopping vegetables, stirring pots, and laughing as they cook the soup together."},
    {text: "output: A bustling kitchen full of life. A large, rustic wooden table overflows with colorful vegetables, herbs, and spices, bathed in warm sunlight streaming through a window. Colorful kitchen art adorns the walls, creating a cozy and inviting atmosphere. Focus on the details and energy of the space, capturing the warmth and vibrancy of a lively kitchen."},
    {text: "input: A vintage map spread out on a table, surrounded by travel magazines, snacks, and a cup of coffee."},
    {text: "output: Create a background image that evokes the feeling of a cozy travel planning session: In the background, subtly incorporate the following details:  A vintage world map, partially visible on a table or wall. Stacks of travel magazines, casually placed on a shelf or coffee table."},
    {text: "input: A close-up of two friends looking at a travel brochure together, possibly with mountains, beaches, or forests in the background."},
    {text: "output: Create a background image that subtly sets the stage for living room with a travel brochure:  The primary focus of the image should be on the space.  A blurred background image of a captivating travel destination. This could be a scenic mountain range, a pristine beach, or a lush forest. Subtly include details like a weathered wooden table, a window with natural light, or a cozy armchair, hinting at a relaxed and inviting environment."},
    {text: "input: A vibrant image capturing the energy and beauty of Tokyo, featuring neon lights, bustling streets, and the iconic Shibuya crossing."},
    {text: "output: Create a vibrant image capturing the energy and beauty of Tokyo, with a focus on Bustling Streets: Show the energy and movement of Tokyo's streets, capturing the mix of pedestrians, cars, and motorbikes. Highlight the vibrancy and diversity of the city's people and culture. Focus: While incorporating all elements, prioritize a balanced composition that highlights the interplay of light, movement, and structure, capturing the unique energy and beauty of Tokyo."},
    {text: "input: A warm, inviting cafe with soft lighting, wooden tables, and potted plants, perfect for a friendly conversation."},
    {text: "output: Create a warm and inviting cafe scene that exudes a friendly and comfortable atmosphere: Lighting: Soft, natural light bathes the cafe in a warm glow, creating a relaxed and inviting ambiance. This could be achieved with large windows, soft lamps, or a combination of both. Tables & Chairs: Feature wooden tables and chairs, preferably with a distressed or rustic finish, adding to the cafe's cozy charm. Potted Plants: Scatter potted plants throughout the scene, adding a touch of nature and vibrancy. These could be placed on shelves, tables, or hanging from the ceiling, creating a lush and inviting atmosphere. Details: Include additional details that contribute to the feeling of a friendly conversation, such as: A few comfy armchairs placed near a window for a more intimate setting. A small bookshelf filled with books and magazines, encouraging browsing and relaxation. A vintage record player playing soft jazz music in the background. Focus: The image should prioritize a feeling of warmth, comfort, and intimacy, creating a space that feels welcoming and perfect for a relaxed conversation."},
    {text: `input: ${prompt}`},
    {text: "output: "},
  ];

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
  });
  
  const generatedText = result.response.text();
  const filteredText = filterRestrictedKeywords(generatedText);
  console.log(generatedText,"gt")
  console.log(filteredText,"ft");
  return filteredText;
}

export default getGeneratedBackgroundImagePrompt;
