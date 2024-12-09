import express from 'express';
import generateScript from '../api/scriptGenerator.js'; 
import { uploadScriptData, retriveScriptData, uploadAnimationScriptData,uploadBackgroundImagePrompts} from '../database/s3.js'; 
import { createAnimationScript } from '../bo/scriptFunctions.js';
import { updateBackgroundImageStatus } from '../database/ddb.js';

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
    const projectId = req.params.projectId;
    const prompt = req.body;
    console.log('Generating Script');
    try{
        // Creating Script
        let scriptData = await generateScript(prompt);
        scriptData = JSON.parse(scriptData);

        // Extracting Background Image prompts 
        const backgroundPrompts = scriptData.scenes.map(scene => scene.backgroundImagePrompt);
        console.log(backgroundPrompts);
        await uploadBackgroundImagePrompts(projectId, { bp : backgroundPrompts});
        updateBackgroundImageStatus(projectId,0);
        // Creating Animation Script
        const animationScript = await createAnimationScript(scriptData);

        // Upload 
        uploadAnimationScriptData(projectId,animationScript);
        uploadScriptData(projectId,scriptData);
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

export default ScriptRouter;