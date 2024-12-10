import axios from 'axios';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Execute gcloud command to get access token
const getAccessToken = () => {
  try {
    const token = execSync('gcloud auth print-access-token').toString().trim();
    if (!token) {
      throw new Error('Access token is empty.');
    }
    return token;
  } catch (error) {
    console.error('Error getting access token:', error.message);
    return null;
  }
};

// Function to get a random fallback image from the public folder and encode it in Base64
const getFallbackImage = () => {
  try {
    const imageNames = ['back1.jpg', 'back2.jpg', 'back3.jpg', 'back4.jpg']; // Replace with actual file names and extensions
    const randomImage = imageNames[Math.floor(Math.random() * imageNames.length)];
    const imagePath = path.join('public', randomImage);
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error('Error reading fallback image:', error.message);
    return null;
  }
};

// Define the request parameters
const getGeneratedImage = async (prompt) => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    console.error('Failed to get access token. Please ensure you are authenticated with gcloud.');
    return getFallbackImage(); // Return a fallback image if access token fails
  }

  const modifedPrompt = "Create an semi-realistic 3d anime style scene background image. " + prompt;

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
      sampleCount: 1,
      aspectRatio: "3:4"
    }
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // Set a timeout for the request
    });

    if (response.status !== 200) {
      console.error(`Unexpected response status: ${response.status}`);
      return getFallbackImage(); // Return a fallback image if the response status is unexpected
    }

    const predictions = response.data.predictions?.[0];
    if (!predictions || !predictions.bytesBase64Encoded) {
      console.error('No valid predictions returned from the model.');
      console.log(response.data);
      console.log(prompt)
      return getFallbackImage(); // Return a fallback image if predictions are invalid
    }

    return predictions.bytesBase64Encoded;
    //return getFallbackImage();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error while making prediction request:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error.message);
    }
    return getFallbackImage(); // Return a fallback image in case of an error
  }
};

export default getGeneratedImage;
