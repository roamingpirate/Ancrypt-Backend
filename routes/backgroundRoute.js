import express from 'express';
import { getBackgroundImageStatus, updateBackgroundImageStatus } from '../database/ddb.js';
import { createBackgroundImage } from '../bo/createBackgroundImage.js';
import { getBackgroundImagePrompt, getImageUrl } from '../database/s3.js';

const BackgroundRouter = express.Router();
BackgroundRouter.use(express.json());


BackgroundRouter.post('/:projectId', async (req,res) => {
    const projectId = req.params.projectId;
    const backgroundStatus = await getBackgroundImageStatus(projectId);
    console.log(backgroundStatus);
    try{
    if(backgroundStatus == 0)
    {
        updateBackgroundImageStatus(projectId,2);
        createBackgroundImage(projectId);
        res.send({message:"creation started",status: 0});
    }
    else if(backgroundStatus == 2)
    {
        res.send({message:"processing",status: 0});
    }
    else {
        res.send({message:"success",status: 1});
    }
    }
    catch(error){
        await updateBackgroundImageStatus(projectId,0);
        res.send({message:"error",});
    }
})


BackgroundRouter.get('/:projectId', async (req, res) => {
    const projectId = req.params.projectId;
    const response = await getBackgroundImagePrompt(projectId);
    const len = response.bp.length;
    const urls = [];

    try{
        for(let i = 0; i < len; i++)
        {
            const url = await getImageUrl(projectId, i);
            urls.push(url);
        }
        res.send(urls);
    }
    catch(err)
    {
        res.send("error");
    }
})

export default BackgroundRouter;