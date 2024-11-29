
import axios from 'axios'
import { execSync } from 'child_process';
import fs from 'fs';

// Execute gcloud command to get access token
const getAccessToken = () => {
  try {
    const token = execSync('gcloud auth print-access-token').toString().trim();
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

// Define the request parameters
const getGeneratedImage = async (prompt) => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    console.error('Failed to get access token.');
    return;
  }

  const modifedPrompt = "Create an semi-realistic 3d anime style scene background image. "+prompt;

  const location = 'us-central1'; 
  const projectId = 'ankrypt';
  const modelVersion = 'imagen-3.0-fast-generate-001'; 

  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelVersion}:predict`;

  const data = {
    instances: [
      {
        prompt: modifedPrompt
      }
    ],
    parameters: {
      sampleCount: 1 ,
      aspectRatio: "3:4"
    }
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    const predictions = response.data.predictions[0];
    const base64EncodedImage = predictions.bytesBase64Encoded;
    return base64EncodedImage;
  } catch (error) {
    console.error('Error making prediction requeest:', error);
    throw error;
  }
};

export default getGeneratedImage;
