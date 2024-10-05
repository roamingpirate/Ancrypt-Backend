import express from 'express';
import cors from 'cors'
import ScriptRouter from './routes/scriptRoute.js';
import AnimationScriptRouter from './routes/animatedScriptRoute.js';
import AudioRouter from './routes/audioRoute.js';
import { retriveAnimationScriptData } from './database/s3.js';
import { createAudio } from './bo/createAudio.js';


const app = express();
app.use(cors());
app.use('/script',ScriptRouter);
app.use('/animationScript',AnimationScriptRouter);
app.use('/audio',AudioRouter);

app.get('/', (req,res) => {
    console.log("pell");
})

import { ElevenLabsClient, play } from "elevenlabs";

const elevenlabs = new ElevenLabsClient({
  apiKey: "sk_43c3fd75226a799512600015838c07a48fb0146ffc9b2da1" // Defaults to process.env.ELEVENLABS_API_KEY
})





app.listen(3000);