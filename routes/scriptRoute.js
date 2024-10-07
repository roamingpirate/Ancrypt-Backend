import express from 'express';
import generateScript from '../api/scriptGenerator.js'; 
import { uploadScriptData, retriveScriptData, uploadAnimationScriptData} from '../database/s3.js'; 
import { createAnimationScript } from '../bo/scriptFunctions.js';

const ScriptRouter = express.Router();
ScriptRouter.use(express.json());

ScriptRouter.get('/', async (req,res) => {
    let scriptData = await retriveScriptData("1");
    console.log(typeof(scriptData));
    if(typeof(scriptData) == 'string')
    {
        scriptData = JSON.parse(scriptData);
    }
    res.json(scriptData);
})

ScriptRouter.post('/', async (req,res) => {
    const prompt = req.body;
    console.log('Generating Script');
    try{
        let scriptData = await generateScript(prompt);
        scriptData = JSON.parse(scriptData);
        res.json(scriptData);   
        uploadScriptData("1",scriptData);
        const animationScript = await createAnimationScript(scriptData);
        uploadAnimationScriptData("1",animationScript);
    }
    catch(err)
    {
        console.log(err);
    }
})

ScriptRouter.post('/update', async(req,res) => {
    const updatedScript = req.body;
    console.log("tello");
    try{
        uploadScriptData("1",updatedScript);
        res.send("success"); 
        const animationScript = await createAnimationScript(updatedScript);
        uploadAnimationScriptData("1",animationScript);  
    }
    catch(err){
        console.log(err);
        res.status(200).send("error");
    }
})



ScriptRouter.post('/animationScript', (req,res) => {
    res.send("na");
    console.log("pello11");
})




export default ScriptRouter;