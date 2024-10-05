import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

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



