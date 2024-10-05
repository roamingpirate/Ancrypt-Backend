import express from 'express';
import {retriveAnimationScriptData} from '../database/s3.js'; 

const AnimationScriptRouter = express.Router();
AnimationScriptRouter.use(express.json());

AnimationScriptRouter.get('/', async (req,res) => {
    const animationScriptData = await retriveAnimationScriptData("1");
    res.json(animationScriptData);
})

export default AnimationScriptRouter;