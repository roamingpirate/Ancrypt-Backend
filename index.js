import express from 'express';
import cors from 'cors'
import ScriptRouter from './routes/scriptRoute.js';
import AnimationScriptRouter from './routes/animatedScriptRoute.js';
import AudioRouter from './routes/audioRoute.js';
import { retriveAnimationScriptData } from './database/s3.js';
//import { createAudio } from './bo/createAudio.js';
import { ElevenLabsClient, play } from "elevenlabs";

const elevenlabs = new ElevenLabsClient({
  apiKey: "sk_26d2102972203c110de41dc6ddb69d197e2896bb6feebe44" // Defaults to process.env.ELEVENLABS_API_KEY
})



const app = express();
app.use(cors());
app.use('/script',ScriptRouter);
app.use('/animationScript',AnimationScriptRouter);
app.use('/audio',AudioRouter);

app.get('/', (req,res) => {
    console.log("pell");
})

import dotenv from 'dotenv';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
dotenv.config();
import fs from 'fs';
import util from 'util';

const textToSpeechClient = new TextToSpeechClient();

const createAudio = async () => {
  const text = 'hello, world!';

  // Construct the request
  const request = {
    input: {text: text},
    voice: {languageCode: 'en-US', ssmlGender: 'FEMALE'},
    audioConfig: {audioEncoding: 'MP3'},
  };

  // Performs the text-to-speech request
  const [response] = await textToSpeechClient.synthesizeSpeech(request);
  // Write the binary audio content to a local file
  const writeFile = util.promisify(fs.writeFile);
  await writeFile('output.mp3', response.audioContent, 'binary');
  console.log('Audio content written to file: output.mp3');
}








app.listen(3000, async () => {
  //createAudio();
});