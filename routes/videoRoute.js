import express from 'express';
const VideoRouter = express.Router();
VideoRouter.use(express.json());
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import { uploadVideo } from '../database/s3.js';
import { checkIsVideoRecorded, updateIsVideoRecorded, updateVideoJobId } from '../database/ddb.js';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

VideoRouter.get('/recordStatus/:projectId', async (req, res) => {
    try{
        const projectId = req.params.projectId;
        const status = await checkIsVideoRecorded(projectId);
        res.send({status: status});
    }
    catch(err){
        res.send(0);
    }
})

VideoRouter.post('/recordStatus/:projectId/:status', async (req, res) => {
    try{
        const status = req.params.status
        const projectId = req.params.projectId;
        await updateIsVideoRecorded(projectId,status);
        if(status == 'false') await updateVideoJobId(projectId,"0");
         res.send("success")
    }
    catch(err){
        res.send("failure");
    }
})

export default VideoRouter;
