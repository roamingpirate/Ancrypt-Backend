import express from 'express';
import {retriveAnimationScriptData} from '../database/s3.js'; 
import { createAudio } from '../bo/createAudio.js';

const AudioRouter = express.Router();
AudioRouter.use(express.json());

AudioRouter.get('/create', async (req,res) => {
    const as = await retriveAnimationScriptData("1");
    const audioData = await createAudio("1",as);
    res.json(audioData);
})

export default AudioRouter;