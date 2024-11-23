import express from 'express';
import generateScript from '../api/scriptGenerator.js'; 
import { uploadScriptData, retriveScriptData, uploadAnimationScriptData,uploadBackgroundImagePrompts, deleteAudioFile} from '../database/s3.js'; 
import { createAnimationScript } from '../bo/scriptFunctions.js';
import { getScriptChanges, updateBackgroundImageStatus, updateScriptChanges } from '../database/ddb.js';

const ScriptRouter = express.Router();
ScriptRouter.use(express.json());

ScriptRouter.get('/:projectId', async (req,res) => {
    const projectId = req.params.projectId;
    let scriptData = await retriveScriptData(projectId);
    console.log(typeof(scriptData));
    if(typeof(scriptData) == 'string')
    {
        scriptData = JSON.parse(scriptData);
    }
    res.json(scriptData);
})

ScriptRouter.post('/:projectId', async (req,res) => {
    const prompt = req.body;
    const projectId = req.params.projectId;
    console.log('Generating Scriptt');
    try{
        let scriptData = await generateScript(prompt);
        console.log("gene script", scriptData)
        scriptData = JSON.parse(scriptData);
        // old method delete audio file 
        await deleteAudioFile(projectId);

        // adding isChanged key to track changes in script so that audio can be created new script isChanged true for all
        // taking isChanged if undefined then take it as true no need to add 

        updateBackgroundImageStatus(projectId,0);
        // extracting BGI prompts 
        const backgroundPrompts = scriptData.scenes.map(scene => scene.backgroundImagePrompt);
        console.log(backgroundPrompts);
        await uploadBackgroundImagePrompts(projectId, { bp : backgroundPrompts});
         
        uploadScriptData(projectId,scriptData);
        const animationScript = await createAnimationScript(scriptData);
        uploadAnimationScriptData(projectId,animationScript);
        res.json(scriptData);  
    }
    catch(err)
    {
        console.log(err);
    }
})

ScriptRouter.post('/update/:projectId', async(req,res) => {
    const projectId = req.params.projectId;
    const updatedScript = req.body;
    console.log("tello");
    try{
        uploadScriptData(projectId,updatedScript);
        const animationScript = await createAnimationScript(updatedScript);
        uploadAnimationScriptData(projectId,animationScript);  
        res.send("success"); 
    }
    catch(err){
        console.log(err);
        res.status(400).send("error");
    }
})


ScriptRouter.post('/changes/:projectId', async(req,res) => {
    const projectId = req.params.projectId;
    const scriptChanges = req.body.changesList;
    console.log(req.body);
    try{
           await updateScriptChanges(projectId,scriptChanges);
           res.send("success");
    }
    catch(err)
    {
        res.status(400).send("error");
    }
})

ScriptRouter.get('/changes/:projectId', async(req,res) => {
    const projectId = req.params.projectId;
    try{
           const result = await getScriptChanges(projectId);
           console.log(result);
           res.send(result);
    }
    catch(err)
    {
        res.status(400).send("error");
    }
})




export default ScriptRouter;