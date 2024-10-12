import express from 'express';
import {retriveAnimationScriptData, retriveAudioFile} from '../database/s3.js'; 
//import { createAudio } from '../bo/createAudio.js';
import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const AudioRouter = express.Router();
AudioRouter.use(express.json());

let audioCreationStatus = {};

AudioRouter.get('/create/:projectId', async (req,res) => {

    const projectId = req.params.projectId;

    if(!(!audioCreationStatus[projectId] || audioCreationStatus[projectId] == "Error" || audioCreationStatus[projectId] == "Done"))
    {
        console.log("Audio Already Getting Created");
        res.status(200).send({message : "Audio Already Getting Created!", status : 1});
        return;
    }

    let worker;
    try{
        const projectId = req.params.projectId;
        const as = await retriveAnimationScriptData("1");
        const workerPath = join(__dirname, '../bo/createAudio.js');
        worker = new Worker(workerPath, { workerData: as });

        worker.on('message', (message) => {
             console.log("tello "+ message);
             audioCreationStatus[projectId] = message;
          });
        
        worker.on('exit', (code) => {
            if(code == 0){
             console.log("dana done");
             audioCreationStatus[projectId] = "Done";
            }
            
            if(code == 1)
            {
                console.log("Error");
                audioCreationStatus[projectId] = "Error";   
            }
        });

        audioCreationStatus[projectId] = "Started";
        res.status(200).send({message : "Audio Creation Started", status : 1});
    }
    catch(err)
    {
        worker.terminate();
        res.status(400).send({ message: "Error", status : 0});
    }
})

AudioRouter.get('/status/:projectId', async(req,res) => {
        const projectId = req.params.projectId;
        if(audioCreationStatus[projectId])
        {
            let isDone = audioCreationStatus[projectId] == "Done";
            res.send({message:audioCreationStatus[projectId], status : isDone? 2: 1});
        }
        else{
            res.send({message: "Audio Creation Not Started", status : 0});
        }
})

AudioRouter.get('/:projectId', async(req,res) => {
    try{
        const projectId = req.params.projectId;
        const response = await retriveAudioFile(projectId);
        if(response.status == 1)
        {
            console.log("Audio Fetched Successfully");
            res.status(200).send(response);
        }
        else{
            console.log("pepo");
            console.log(response.data);
            res.status(200).send(response);
        }
    }
    catch(err)
    {
        console.log("error occured");
        res.status(400).send(err.message);
    }
})

export default AudioRouter;