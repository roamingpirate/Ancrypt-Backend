
import { getBackgroundImagePrompt, uploadImageFile} from "../database/s3.js";
import getGeneratedImage from "../api/backgroundGenerator.js";
import getGeneratedBackgroundImagePrompt from "../api/backgroundPromptcreator.js";
import { updateBackgroundImageStatus } from "../database/ddb.js";



export const createBackgroundImage = async (projectId) => {
    let i =0;
    try{
        const response = await getBackgroundImagePrompt(projectId);
        const prompts = response.bp;
        console.log('prompts');
        console.log(prompts);
        for(const prompt of prompts) {
            console.log("creating image for " + prompt);
            const backgroundPrompt = await getGeneratedBackgroundImagePrompt(prompt);
            const base64Image = await getGeneratedImage(backgroundPrompt);
            await uploadImageFile(1,base64Image,i);
            i++;
        }
        await updateBackgroundImageStatus(projectId,1);
    }
    catch(err){
        throw err;
    }
}
