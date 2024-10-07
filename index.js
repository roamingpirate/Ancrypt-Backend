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






app.listen(3000);