import express from 'express';
import {getAudioFile, getAudioPart, retriveAnimationScriptData, retriveAudioFile, retriveScriptData, updateScriptAudioPart, uploadAudioFile, uploadScriptData} from '../database/s3.js'; 
//import { createAudio } from '../bo/createAudio.js';
import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getScriptChanges, updateScriptChanges } from '../database/ddb.js';
import { createAudioForSpeech } from '../bo/createAudioForSpeech.js';
import Piscina from 'piscina';
import os from 'os';
import { FixedThreadPool, PoolEvents, availableParallelism } from 'poolifier'

// a fixed worker_threads pool
const pool = new FixedThreadPool(1, './audioCreateWorker.js', {
  onlineHandler: () => console.info('worker is online'),
  errorHandler: e => console.error(e),
})

pool.emitter?.on(PoolEvents.ready, () => console.info('Pool is ready'))
pool.emitter?.on(PoolEvents.busy, () => console.info('Pool is busy'))
pool.emitter?.on(PoolEvents.full, () => console.info('Pool is full'))


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const AudioRouter = express.Router();
AudioRouter.use(express.json());
// const pool = new Piscina({
//     filename: './audioCreateWorker.js', // Your worker thread script
//     maxThreads: Math.max(1, 4), // Leave 1 CPU for the main thread
//   });

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
    const { projectId, sceneIndex, scriptIndex } = req.params;

    try {
      const animationScript = await retriveAnimationScriptData(projectId);
  
      // Offload the audio creation to a worker
      const result = await pool.run({ projectId, animationScript, sceneIndex, scriptIndex });
  
      // Update the database with the generated audio parts
      await updateScriptAudioPart(projectId, sceneIndex, scriptIndex, result);
  
      res.json({ success: true, result });
    } catch (error) {
      console.error('Error processing audio:', error);
      res.status(500).json({ success: false, message: 'Failed to process audio', error });
    }
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


AudioRouter.get('/createAudio/:projectId', async (req, res) => {
    console.log("Fetching audio...");
    const projectId = req.params.projectId;
    const scriptData = await retriveScriptData(projectId);
    const animationScript = await retriveAnimationScriptData(projectId);
    let script = scriptData.scenes;

    const audioPartMap = new Map();
    const audioPartCreationPromises = [];
    let isAudioChanged = false;

    for (let i = 0; i < script.length; i++) {
        const sceneScript = script[i].script;
        for (let j = 0; j < sceneScript.length; j++) {
            const speechObj = sceneScript[j];
            if (speechObj["isChanged"] !== false) {
                console.log("zozi", "creating audio for " + i + j);
                isAudioChanged = true;
                const sceneIndex = i;
                const scriptIndex = j;

                audioPartCreationPromises.push(
                    pool.execute({ projectId, animationScript, sceneIndex, scriptIndex })
                      .then((result) => {
                        console.log("Audio created for " + i + j);
                        audioPartMap.set(`${i}${j}`, { i, j, result });
                      })
                      .catch((err) => {
                        console.error(`Error creating audio for ${i}${j}:`, err);
                        // Handle error (e.g., log it, retry the task, etc.)
                      })
                  );

                // const result = await createAudioForSpeech(projectId,animationScript, sceneIndex, scriptIndex);
                //             console.log("audio created for " + i + j);
                //             audioPartMap.set(`${i}${j}`, { i, j, result });         

            } else {
                console.log("zozi", "audio present for " + i + j);
            }
        }
    }

    await Promise.all(audioPartCreationPromises);

    if(isAudioChanged)
    {
        audioPartMap.forEach((value, key) => {
            console.log(`Key: ${key}, i: ${value.i}, j: ${value.j}, result: ${value.result}`);
            const sceneIndex = value.i;
            const scriptIndex = value.j;
            const scriptScene = scriptData["scenes"][sceneIndex];
            const scriptSceneScript = scriptScene["script"][scriptIndex];
            scriptSceneScript["audioPart"] = value.result;
            scriptSceneScript["isChanged"] = false;
            scriptData["scenes"][sceneIndex]["script"][scriptIndex]= scriptSceneScript;
        });

        script = scriptData.scenes;
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
                    console.log("Fething audio")
                    const audioPartD = await getAudioPart(projectId, speechObj["audioPart"]);
                    sceneAudioFile.push(audioPartD);
                    console.log("audio fetched");
                }
    
                console.log(i+" "+j);
            
            }
            audioFile.push(sceneAudioFile);
        }   

        await uploadAudioFile(projectId,audioFile);  
        await uploadScriptData(projectId,scriptData);
        res.send(audioFile);  
        return;
    }
    console.log("aaeyo");
    const result = await getAudioFile(projectId);
    res.send(result);
})




export default AudioRouter;