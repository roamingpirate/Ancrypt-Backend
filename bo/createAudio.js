import { exec } from "child_process";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { promises as fs , createWriteStream} from "fs";
import { parentPort, workerData } from "worker_threads";
import { uploadAudioFile } from '../database/s3.js';
import dotenv from 'dotenv';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import util from 'util';
dotenv.config();


const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


const writeFileAsync = (fileName, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, data, (err) => {
      if (err) {
        reject(err);  // Reject if there's an error
      } else {
        resolve();  // Resolve if the operation is successful
      }
    });
  });
};

  // Coverting format
  const convertAudioFile = async (inputFile, outputFile) => {
    ffmpeg.setFfmpegPath(ffmpegPath);
    return new Promise((resolve, reject) => {
      ffmpeg(inputFile)
        .toFormat('wav')
        .on('end', () => {
          console.log('Conversion finished successfully');
          resolve(outputFile);
        })
        .on('error', (err) => {
          console.error('Error during conversion:', err.message);
          reject(err);
        })
        .save(outputFile);
    });
  };

  // Executing External commands
  const execCommand = (command) => {
        return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) reject(error);
            resolve(stdout);
        });
        });
    };

  // Reading Lipsync file 
  const readJsonTranscript = async (file) => {
    const data = await fs.readFile(file, "utf8");
    return JSON.parse(data);
  };
  
  // Coverting audiofile to text 
  const audioFileToBase64 = async (file) => {
    const data = await fs.readFile(file);
    return data.toString("base64");
  };


  const textToSpeechClient = new TextToSpeechClient();


const lipSyncMessage = async (pid,i, j,k) => {
    const time = new Date().getTime();
    console.log(`Starting conversion for message ${k}${i}${j}`);
    const inputFilePath = `./public/audios/${pid}/dialog_${k}${i}${j}.mp3`;
    const outputFilePath = `./public/audios/${pid}/dialog_${k}${i}${j}.wav`
   // await convertAudioFile(inputFilePath,outputFilePath);
    console.log(`Conversion done in ${new Date().getTime() - time}ms`);
    await execCommand(
      `bin\\rhubarb.exe -f json -o .\\public\\audios\\${pid}\\dialog_${k}${i}${j}.json .\\public\\audios\\${pid}\\dialog_${k}${i}${j}.wav -r phonetic`
    );
    console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
  };


  export const createAudio = async (projectId,animationScript) => {
    console.log("Creating audio");
    let audioData = [];
    parentPort.postMessage("Running!");
    let count =0;

    for(let k=0;k<animationScript.length;k++){
        const speechArr = animationScript[k].Script;
        let SceneaudioData = [];
            for (let i = 0; i < speechArr.length; i++) {
                let SpeechAudioData = [];
                const isFemale = speechArr[i].Speaker === "Garv" ? false : true;
                const dialogArr = speechArr[i].Speech;
          
                  for (let j = 0; j < dialogArr.length; j++) {
                     const dialog = dialogArr[j].Text;
                    console.log("Current DIalog: " + dialog);
                    const fileName = `./public/audios/${projectId}/dialog_${k}${i}${j}.wav`;

                    const request = {
                      input: {text: dialog},
                      voice: {languageCode: 'en-US', ssmlGender: 'FEMALE'},
                      audioConfig: {audioEncoding: 'LINEAR16'},
                    };

                    const [response] = await textToSpeechClient.synthesizeSpeech(request);
                    //console.log(response.audioContent);
                  //  const writeFile = util.promisify(fs.writeFile);
                    await fs.writeFile(fileName, response.audioContent);
                    console.log('File written successfully!');
                   // await delay(10000);
                    
                    await lipSyncMessage(projectId,i, j,k);

                  //  // await delay(2000);

                    const currentAudioData = {
                      audio: await audioFileToBase64(fileName),
                      lipsync: await readJsonTranscript(
                        `./public/audios/${projectId}/dialog_${k}${i}${j}.json`
                      ),
                    };
                    count= count +1;
                    parentPort.postMessage(`${count} audio files created!`)
                    SpeechAudioData.push(currentAudioData);
                  }
              SceneaudioData.push(SpeechAudioData);
            } 
            audioData.push(SceneaudioData);
    }
  
    console.log("pello");
    console.log("audioData created");
    //await uploadAudioFile(1,audioData);
    // //return audioData;
    try{
      await uploadAudioFile(1,audioData);
    }
    catch(err)
    {
       process.exit(1);
    }
    // process.exit(0);

  };


  createAudio("1", workerData);
