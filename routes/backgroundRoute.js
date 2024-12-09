import express from 'express';
import { getBackgroundImageStatus, updateBackgroundImageStatus } from '../database/ddb.js';
import createBackgroundImage  from '../bo/createBackgroundImage.js';
import { getBackgroundImagePrompt, getImageUrl } from '../database/s3.js';
import { FixedThreadPool, PoolEvents, availableParallelism } from 'poolifier'

const BackgroundRouter = express.Router();
BackgroundRouter.use(express.json());

const BackgroundCreatorWorkerPool = new FixedThreadPool(1, './bo/createBackgroundImage.js', {
  onlineHandler: () => console.info('worker is online'),
  errorHandler: e => console.error(e),
})

BackgroundCreatorWorkerPool.emitter?.on(PoolEvents.ready, () => console.info('BGPool is ready'))
BackgroundCreatorWorkerPool.emitter?.on(PoolEvents.busy, () => console.info('BGPool is busy'))
BackgroundCreatorWorkerPool.emitter?.on(PoolEvents.full, () => console.info('BGPool is full'))

BackgroundRouter.get('/:projectId', async (req, res) => {
    const projectId = req.params.projectId;

    try{     
        const promptData = await getBackgroundImagePrompt(projectId);
        const len = promptData.bp.length;
        const urls = [];
        const backgroundStatus = await getBackgroundImageStatus(projectId);

        if(backgroundStatus == 0)
        {
            console.log("Background Image not available ... Creating background image");
            //await createBackgroundImage(projectId,promptData);
            await BackgroundCreatorWorkerPool.execute({projectId,promptData});
            await updateBackgroundImageStatus(projectId,1);
        }

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