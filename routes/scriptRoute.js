import express from 'express';
import generateScript from '../api/scriptGenerator.js'; 
import { uploadScriptData, retriveScriptData, uploadAnimationScriptData} from '../database/s3.js'; 
import { createAnimationScript } from '../bo/scriptFunctions.js';

const ScriptRouter = express.Router();
ScriptRouter.use(express.json());

ScriptRouter.get('/', async (req,res) => {
    const scriptData = await retriveScriptData("1");
    res.json(scriptData);
})

ScriptRouter.post('/', async (req,res) => {
    const prompt = req.body;
    console.log('Generating Script');
    try{
        const scriptData = await generateScript(prompt);
        res.json(scriptData);   
        uploadScriptData("1",scriptData);
        const animationScript = await createAnimationScript(JSON.parse(scriptData));
        uploadAnimationScriptData("1",animationScript);
    }
    catch(err)
    {
        console.log(err);
    }
})

ScriptRouter.post('/update', async(req,res) => {
    const updatedScript = req.body;
    try{
        uploadScriptData("1",updatedScript);
        const animationScript = await createAnimationScript(JSON.parse(updatedScript));
        uploadAnimationScriptData("1",updatedScript);
        res.json(updatedScript);   
    }
    catch{
        console.log(err);
    }
})



ScriptRouter.post('/animationScript', (req,res) => {
    res.send("na");
    console.log("pello11");
})




export default ScriptRouter;