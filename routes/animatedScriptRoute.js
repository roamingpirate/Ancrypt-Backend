import express from 'express';
import {retriveAnimationScriptData, uploadAnimationScriptData} from '../database/s3.js'; 

const AnimationScriptRouter = express.Router();
AnimationScriptRouter.use(express.json());

AnimationScriptRouter.get('/:projectId', async (req,res) => {
    const projectId = req.params.projectId;
    const animationScriptData = await retriveAnimationScriptData(projectId);
    res.json(animationScriptData);
})


AnimationScriptRouter.post('/update/:projectId', async (req,res) => {
    try{
    const animationScriptData = req.body;
    const projectId = req.params.projectId;
    //console.log(animationScriptData);
    await uploadAnimationScriptData(projectId, animationScriptData);
    res.send("success");
    }
    catch(err)
    {
        console.log("Animation Script Error");
        res.status(400).send("Animation Script Error");
    }
})

export default AnimationScriptRouter;