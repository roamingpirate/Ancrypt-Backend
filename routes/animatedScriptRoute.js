import express from 'express';
import {retriveAnimationScriptData, uploadAnimationScriptData} from '../database/s3.js'; 

const AnimationScriptRouter = express.Router();
AnimationScriptRouter.use(express.json());

AnimationScriptRouter.get('/', async (req,res) => {
    const animationScriptData = await retriveAnimationScriptData("1");
    res.json(animationScriptData);
})


AnimationScriptRouter.post('/update', async (req,res) => {
    try{
    const animationScriptData = req.body;
    //console.log(animationScriptData);
    await uploadAnimationScriptData("1", animationScriptData);
    res.send("success");
    }
    catch(err)
    {
        console.log("Animation Script Error");
        res.status(400).send("Animation Script Error");
    }
})

export default AnimationScriptRouter;