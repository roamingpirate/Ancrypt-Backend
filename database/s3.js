import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
import { getScriptChanges } from "./ddb.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
//import { projects } from "elevenlabs/api";

dotenv.config();

const streamToString = (stream) => {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (chunk) => {
        chunks.push(chunk);
      });
      stream.on('error', reject);
      stream.on('end', () => {
        resolve(Buffer.concat(chunks).toString('utf-8'));
      });
    });
  };

const s3 = new S3Client({
    region: process.env.S3BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_KEY
    }
  });


const bucketName = process.env.S3BUCKET_NAME;

export const uploadScriptData = async (projectId,scriptData) => {
    const scriptDataKey = `${projectId}/script.json`;

    try{
        const params = {
            Bucket: bucketName,
            Key: scriptDataKey,
            Body: JSON.stringify(scriptData),
            ContentType: 'application/json'
        }

        const data = await s3.send(new PutObjectCommand(params));
        console.log("Script Uploaded Successfully");
    }
    catch(err)
    {
        console.log("Error in uploading script");
        console.log(err.message);
    }

}

export const retriveScriptData = async (projectId) => {
    const scriptDataKey = `${projectId}/script.json`;

    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: scriptDataKey,
        });

        const dataStream = await s3.send(command);
        const data = await streamToString(dataStream.Body);
        
        return JSON.parse(data);
    } catch (err) {
        if (err.name === 'NoSuchKey') {
            console.log("Item not found, returning empty array");
            return {scenes: []};
        } else {
            console.log("Error: " + err.message);
            throw err;
        }
    }
};


export const uploadSpeakerData = async (projectId,speakerData) => {
    const speakerDataKey = `${projectId}/speaker.json`;

    try{
        const params = {
            Bucket: bucketName,
            Key: speakerDataKey,
            Body: JSON.stringify(speakerData),
            ContentType: 'application/json'
        }

        const data = await s3.send(new PutObjectCommand(params));
        console.log("speaker data Uploaded Successfully");
    }
    catch(err)
    {
        console.log("Error in uploading speakerData");
        console.log(err.message);
    }

}


export const retriveSpeakerData = async (projectId) => {
    const speakerDataKey = `${projectId}/speaker.json`;

    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: speakerDataKey,
        });

        const dataStream = await s3.send(command);
        const data = await streamToString(dataStream.Body);

        return JSON.parse(data);
    } catch (err) {
        if (err.name === 'NoSuchKey') {
            console.log(`Speakerr data not found for project: ${projectId}`);
            return [];
        }

        console.error("Error: " + err.message);
        throw err;
    }
};


export const uploadAnimationScriptData = async (projectId,animationScriptData) => {
    const scriptDataKey = `${projectId}/animationScript.json`;

    try{
        const params = {
            Bucket: bucketName,
            Key: scriptDataKey,
            Body: JSON.stringify(animationScriptData),
            ContentType: 'application/json'
        }

        const data = await s3.send(new PutObjectCommand(params));
        console.log("Animation Script Uploaded Successfully");
    }
    catch(err)
    {
        console.log("Error in uploading Animation Script");
        console.log(err.message);
    }

}


export const retriveAnimationScriptData = async (projectId) => {
    const scriptDataKey = `${projectId}/animationScript.json`;

    try{
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: scriptDataKey,
          });

          const dataStream = await s3.send(command);
          const data = await streamToString(dataStream.Body);
          
          return JSON.parse(data);
      
    }
    catch(err){
        console.log("error"+err.message);
    }
}

export const uploadAudioFile = async (projectId,audioData) => {
    const audioDataKey = `${projectId}/audio.json`;

    try{
        const params = {
            Bucket: bucketName,
            Key: audioDataKey,
            Body: JSON.stringify(audioData),
            ContentType: 'application/json'
        }

        const data = await s3.send(new PutObjectCommand(params));
        console.log("Audio Uploaded Successfully");
    }
    catch(err)
    {
        console.log("Error in uploading Audio");
        console.log(err.message);
        throw err;
    }   
}


export const retriveAudioFile = async (projectId) => {
    const audioDataKey = `${projectId}/audio.json`;

    try{

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: audioDataKey,
          });

          const dataStream = await s3.send(command);
          const data = await streamToString(dataStream.Body);

          const changesList = await getScriptChanges(projectId);
          console.log(changesList);
          if(changesList.length > 0)
          {
              return {data: "update audio file", status : 2}
          }

          
          return {data: JSON.parse(data), status : 1};
    }
    catch(err)
    {
        console.log("File Dont Exist");
        console.log(err.message);
        return { data : "File dont exist", status : 0};
    }   
}


export const getAudioFile = async (projectId) => {
    const audioDataKey = `${projectId}/audio.json`;

    try{
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: audioDataKey,
          });

          const dataStream = await s3.send(command);
          const data = await streamToString(dataStream.Body);
          
          return JSON.parse(data);
    }
    catch(err)
    {
        console.log("File Dont Exist");
        console.log(err.message);
        return { data : "File dont exist", status : 0};
    }   
}

export const deleteAudioFile = async (projectId) => {
    const audioDataKey = `${projectId}/audio.json`;

    try {
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: audioDataKey,
        });

        await s3.send(command); // Send the delete command
        console.log(`Successfully deleted ${audioDataKey}`);
        return { message: "File deleted successfully", status: 1 };
    } catch (err) {
        console.log("Error deleting file");
        console.log(err.message);
        return { message: "File doesn't exist or could not be deleted", status: 0 };
    }
};

export const uploadAudioPart = async (projectId,audioPartName,audioPartData) => {
    const audioDataKey = `${projectId}/audio/${audioPartName}.json`;

    try{
        const params = {
            Bucket: bucketName,
            Key: audioDataKey,
            Body: JSON.stringify(audioPartData),
            ContentType: 'application/json'
        }

        const data = await s3.send(new PutObjectCommand(params));
        console.log("Audio Part Uploaded Successfully");
    }
    catch(err)
    {
        console.log("Error in uploading Audio Part");
        console.log(err.message);
        throw err;
    }   
}

export const getAudioPart = async (projectId,audioPartName) => {
    const audioDataKey = `${projectId}/audio/${audioPartName}.json`;

    try{
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: audioDataKey,
          });

          const dataStream = await s3.send(command);
          const data = await streamToString(dataStream.Body);
          
          return JSON.parse(data);
    }
    catch(err)
    {
        console.log("File Dont Exist");
        console.log(err.message);
        return { data : "File dont exist", status : 0};
    }   
}

export const deleteAudioPart = async (projectId, audioPartName) => {
    const audioDataKey = `${projectId}/audio/${audioPartName}.json`;

    try {
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: audioDataKey,
        });

        await s3.send(command); // Send the delete command
        console.log(`Successfully deleted audio part ${audioDataKey}`);
        return { message: "File deleted successfully", status: 1 };
    } catch (err) {
        console.log("Error deleting file");
        console.log(err.message);
        return { message: "File doesn't exist or could not be deleted", status: 0 };
    }
};

export const updateScriptAudioPart = async (projectId, sceneIndex, scriptIndex, audioPartData) => {
    const script = await retriveScriptData(projectId);
    const scriptScene = script["scenes"][sceneIndex];
    const scriptSceneScript = scriptScene["script"][scriptIndex];

    if(scriptSceneScript["audioPart"] != undefined)
    {
        // delete that audio part
        await deleteAudioPart(projectId, scriptSceneScript["audioPart"])
    }
    const timestamp = Date.now();
   // const audioPartName = projectId+"_"+"audio_"+timestamp;
    const audioPartName = `${projectId}_audio_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
    console.log(`${audioPartName}`);
    await uploadAudioPart(projectId,audioPartName, audioPartData);
    scriptSceneScript["audioPart"] = audioPartName;
    scriptSceneScript["isChanged"] = false;
    script["scenes"][sceneIndex]["script"][scriptIndex]= scriptSceneScript;
    await uploadScriptData(projectId,script);
}

export const uploadImageFile = async (projectId,base64Image,ImageNo) => {

    const imageDataKey = `${projectId}/back${ImageNo}.png`;
    const imageBuffer = Buffer.from(base64Image, 'base64');

    try{
        const params = {
            Bucket: bucketName,
            Key: imageDataKey,
            Body: imageBuffer,
            ContentEncoding: 'base64',
            ContentType: 'image/png'    
        }

        const data = await s3.send(new PutObjectCommand(params));
        console.log("Image Uploaded Successfully");
    }
    catch(err)
    {
        console.log("Error in uploading Image");
        console.log(err.message);
        throw err;
    }   
}

export const uploadBackgroundImagePrompts = async (projectId, backgroundPrompts) => {
    const bpKey = `${projectId}/backgroundPrompts.json`;

    try{
        const params = {
            Bucket: bucketName,
            Key: bpKey,
            Body: JSON.stringify(backgroundPrompts),
            ContentType: 'application/json'
        }

        const data = await s3.send(new PutObjectCommand(params));
        console.log("Background Prompt Uploaded Successfully");
    }
    catch(err)
    {
        console.log("Error in uploading Background Prompt");
        console.log(err.message);
        throw err;
    }   
}

export const getBackgroundImagePrompt = async (projectId) => {
    const bpKey = `${projectId}/backgroundPrompts.json`;

    try{
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: bpKey,
          });

          const dataStream = await s3.send(command);
          const data = await streamToString(dataStream.Body);
          
          return JSON.parse(data);
    }
    catch(err)
    {
        console.log("File Dont Exist");
        console.log(err.message);
        return { data : "File dont exist", status : 0};
    }   
}


const fallbackImages = [
    "https://ancript-videos.s3.us-east-1.amazonaws.com/Abstract+Botanical+Poster+en+Print%2C+Botanische+Wanddecoratie%2C+Groen+Interieur%2C+Modern+_+MDRN+HOME.jpg",
    "https://ancript-videos.s3.us-east-1.amazonaws.com/Fondo+Papel+Pintado+Abstracto+Azul+Pastel+de+Pantalla+Imagen+para+Descarga+Gratuita+-+Pngtree.jpg",
    "https://ancript-videos.s3.us-east-1.amazonaws.com/Green+Abstract+Geometric+Waves+Wallpaper+R9320+-+Roll.jpg",
    "https://ancript-videos.s3.us-east-1.amazonaws.com/Hovia+-+Consciously+Designed+Wallpaper+%26+Murals.jpg",
    "https://ancript-videos.s3.us-east-1.amazonaws.com/Large+Painting%2C+Blue+White+Oversize+Abstract+Wall+Art+Living+Room%2C+Extra+Large+Original+Aqua+Painting+Canvas+Abstract+Water+Spiral+Painting.jpg"
  ];


  export const getImageUrl = async (projectId, ImageNo) => {
    const imageDataKey = `${projectId}/back${ImageNo}.png`;
    try {
        const params = {
            Bucket: bucketName,
            Key: imageDataKey,
        }

        // Attempt to get the object from S3
        const command = new GetObjectCommand(params);
        await s3.send(command);

        // If the object exists, generate the pre-signed URL
        const url = await getSignedUrl(s3, command, { expiresIn: 36000 });
        console.log("Pre-signed URL:", url);
        return url;
    }
    catch (err) {
        console.error("Error generating pre-signed URL:", err);

        // If the image doesn't exist, return a random fallback URL
        const randomIndex = Math.floor(Math.random() * fallbackImages.length);
        const fallbackUrl = fallbackImages[randomIndex];
        console.log("Fallback URL:", fallbackUrl);
        return fallbackUrl;
    }
}


export const uploadVideo = async (videoKey,videoData) =>{
    const params = {
        Bucket: 'ancript-videos',
        Key: videoKey,
        Body: videoData,
        ContentType: 'video/mp4',
        ACL: 'public-read', 
    };

    try {
        const data = await s3.send(new PutObjectCommand(params));
        console.log("Video uploaded successfully to S3");
        return data;
    } catch (err) {
        console.error("Error uploading video to S3:", err.message);
        throw err;
    }
}






