import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';

import ScriptRouter from './routes/scriptRoute.js';
import AnimationScriptRouter from './routes/animatedScriptRoute.js';
import AudioRouter from './routes/audioRoute.js';
import BackgroundRouter from './routes/backgroundRoute.js';
import SpeakerRouter from './routes/speakerRoute.js';
import UserRouter from './routes/userRoute.js';
import VideoRouter from './routes/videoRoute.js';
import { fetchProjectDetails} from './database/ddb.js';

dotenv.config();
const corsOptions = {
  origin: ['https://ancript.com', 'http://localhost:5173'], 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, 
};


const app = express();
app.use(cors(corsOptions));
app.use('/script',ScriptRouter);
app.use('/animationScript',AnimationScriptRouter);
app.use('/audio',AudioRouter);
app.use('/background',BackgroundRouter);
app.use('/speaker',SpeakerRouter);
app.use('/user',UserRouter)
app.use('/video',VideoRouter)

app.get('/hello', (req,res) => {
    console.log("pell");
    res.send("hello")
})

app.get('/project/:userId/:projectId', async (req, res) => {
    const projectId = req.params.projectId;
    const userId = req.params.userId;
    console.log(projectId, userId);
    const response = await fetchProjectDetails(userId, projectId);
    res.send(response);
})

app.listen(8080, async () => {
  console.log("Server Started");
});