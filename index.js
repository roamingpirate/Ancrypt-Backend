import express from 'express';
import cors from 'cors'
import ScriptRouter from './routes/scriptRoute.js';
import AnimationScriptRouter from './routes/animatedScriptRoute.js';
import AudioRouter from './routes/audioRoute.js';
import BackgroundRouter from './routes/backgroundRoute.js';
import { getImageUrl, retriveAnimationScriptData, uploadImageFile } from './database/s3.js';
//import { createAudio } from './bo/createAudio.js';
import { ElevenLabsClient, play } from "elevenlabs";
import getGeneratedImage from './api/backgroundGenerator.js';
import SpeakerRouter from './routes/speakerRoute.js';

import dotenv from 'dotenv';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
dotenv.config();
import fs from 'fs';
import util from 'util';
import getBackgroundImagePrompt from './api/backgroundPromptcreator.js';
import {createBackgroundImage} from './bo/createBackgroundImage.js';
import { fetchProjectDetails, getBackgroundImageStatus, updateBackgroundImageStatus } from './database/ddb.js';
const elevenlabs = new ElevenLabsClient({
  apiKey: "sk_26d2102972203c110de41dc6ddb69d197e2896bb6feebe44" // Defaults to process.env.ELEVENLABS_API_KEY
})

import UserRouter from './routes/userRoute.js';
import { GetavatarCreatorToken } from './bo/avatarCreatorToken.js';
import VideoRouter from './routes/videoRoute.js';


const app = express();
app.use(cors());
app.use('/script',ScriptRouter);
app.use('/animationScript',AnimationScriptRouter);
app.use('/audio',AudioRouter);
app.use('/background',BackgroundRouter);
app.use('/speaker',SpeakerRouter);
app.use('/user',UserRouter)
app.use('/video',VideoRouter)

app.get('/', (req,res) => {
    console.log("pell");
})

app.get('/project/:userId/:projectId', async (req, res) => {
    const projectId = req.params.projectId;
    const userId = req.params.userId;
    console.log(projectId, userId);
    const response = await fetchProjectDetails(userId, projectId);
    res.send(response);
})




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








app.listen(8080, async () => {
  //createAudio();
  if(1){
   // getImageUrl(1,1);
    //await createBackgroundImage(1);
    //await updateBackgroundImageStatus(1, 2);
   // getBackgroundImageStatus(1);
     //getBackgroundImagePrompt("A lively kitchen scene with Bob and Pam chopping vegetables, stirring pots, and laughing as they cook the soup together.")
      //const base64image = await getGeneratedImage("A lively kitchen scene with Bob and Pam chopping vegetables, stirring pots, and laughing as they cook the soup together.");
      //await uploadImageFile(1,base64image,0);
      //GetavatarCreatorToken();
  }
});