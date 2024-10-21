import express from 'express';
import { retriveSpeakerData, uploadSpeakerData } from '../database/s3.js';
const SpeakerRouter = express.Router();
SpeakerRouter.use(express.json());


SpeakerRouter.get('/:projectId', async (req,res) => {
    const projectId = req.params.projectId;
    let speakerData = await retriveSpeakerData(projectId);
    console.log(typeof(speakerData));
    if(typeof(speakerData) == 'string')
    {
        speakerData = JSON.parse(speakerData);
    }
    res.json(speakerData.speakerList);
})

SpeakerRouter.post('/update/:projectId', async(req,res) => {
    const updatedSpeaker = req.body;
    const projectId = req.params.projectId;
    console.log("tello");
    try{
        uploadSpeakerData(projectId,updatedSpeaker);
        res.send("success"); 
    }
    catch(err){
        console.log(err);
        res.status(400).send("error");
    }
})

export default SpeakerRouter;