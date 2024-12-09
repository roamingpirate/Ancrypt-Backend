import { getBackgroundImagePrompt, uploadImageFile} from "../database/s3.js";
import getGeneratedImage from "../api/backgroundGenerator.js";
import getGeneratedBackgroundImagePrompt from "../api/backgroundPromptcreator.js";
import { updateBackgroundImageStatus } from "../database/ddb.js";
import { ThreadWorker } from 'poolifier'


const createBackgroundImage = async (task) => {

    const {projectId,promptData} = task
    
    try {
        const prompts = promptData.bp;
        console.log('prompts:', prompts);

        const backgroundImagePromises = prompts.map(async (prompt, i) => {
            try {
                console.log("Creating image for:", prompt);
                const backgroundPrompt = await getGeneratedBackgroundImagePrompt(prompt);
                const base64Image = await getGeneratedImage(backgroundPrompt);
                await uploadImageFile(projectId, base64Image, i);
            } catch (err) {
                console.error(`Error processing prompt "${prompt}":`, err);
                throw err;
            }
        });

        await Promise.all(backgroundImagePromises);
    } catch (err) {
        console.error("Error in createBackgroundImage:", err);
        throw err;
    }
};

export default new ThreadWorker(createBackgroundImage, {
  maxInactiveTime: 60000,
})

