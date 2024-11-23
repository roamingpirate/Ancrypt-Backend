import express from 'express';
import {getAudioFile, getAudioPart, retriveAnimationScriptData, retriveAudioFile, retriveScriptData, updateScriptAudioPart} from '../database/s3.js'; 
//import { createAudio } from '../bo/createAudio.js';
import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getScriptChanges, updateScriptChanges } from '../database/ddb.js';
import { createAudioForSpeech } from '../bo/createAudioForSpeech.js';

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
        await updateScriptChanges(projectId, []);
        const as = await retriveAnimationScriptData(projectId);
        const workerPath = join(__dirname, '../bo/createAudio.js');
        worker = new Worker(workerPath, { workerData: {as,projectId}});

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


AudioRouter.get('/createPart/:projectId/:sceneIndex/:scriptIndex', async (req,res) => {
    const projectId = req.params.projectId;
    const sceneIndex = req.params.sceneIndex;
    const scriptIndex = req.params.scriptIndex;
    const as = await retriveAnimationScriptData(projectId);
    const result = await createAudioForSpeech(projectId,as,sceneIndex,scriptIndex);

    await updateScriptAudioPart(projectId,sceneIndex,scriptIndex,result)
    res.send(result);
})

AudioRouter.get('/createAudioFile/:projectId', async (req,res) => {
    const projectId = req.params.projectId;
    let script = await retriveScriptData(projectId);
    script = script.scenes;

    const audioFile = [];
    for(let i =0;i< script.length;i++) {
        const sceneAudioFile = [];
        const sceneScript = script[i].script;
        
        for(let j=0;j<sceneScript.length;j++)
        {
            const speechObj = sceneScript[j];
            if(speechObj["audioPart"] == undefined)
            {
                sceneAudioFile.push([{audio: "", lipsync: ""}]);
            }
            else{
                const audioPartD = await getAudioPart(projectId, speechObj["audioPart"]);
                sceneAudioFile.push(audioPartD);
            }

            console.log(i+" "+j);
        
        }
        audioFile.push(sceneAudioFile);
    }

    res.send(audioFile);
})

AudioRouter.get('/update/:projectId', async (req,res) => {

    const projectId = req.params.projectId;
    console.log("Update API called!");
    const audioData = req.body.data;

    if(!(!audioCreationStatus[projectId] || audioCreationStatus[projectId] == "Error" || audioCreationStatus[projectId] == "Done"))
    {
        console.log("Audio Already Updated Created");
        res.status(200).send({message : "Audio Already Getting Updated!", status : 1});
        return;
    }

    let worker;
    try{
        const projectId = req.params.projectId;
        const as = await retriveAnimationScriptData(projectId);
        const changesList = await getScriptChanges(projectId);
        const audioData = await getAudioFile(projectId);
        //const workerPath = join(__dirname, '../bo/updateAudio.js');
        //worker = new Worker(workerPath, { workerData: {as, audioData, changesList,projectId}});
        const workerPath = join(__dirname, '../bo/createAudio.js');
        worker = new Worker(workerPath, { workerData: {as,projectId}});

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

        audioCreationStatus[projectId] = "Updating audio";
        res.status(200).send({message : "Audio Update Started", status : 1});
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
            console.log("Audio Fetched Succeessfully");
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

AudioRouter.get('/update/:projectId', async(req,res) => {
    try{
           
    }
    catch(err)
    {

    }
})

export default AudioRouter;