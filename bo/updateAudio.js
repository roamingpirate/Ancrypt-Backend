import { exec } from "child_process";
import { ElevenLabsClient} from "elevenlabs";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { promises as fs , createWriteStream} from "fs";
import { parentPort, workerData } from "worker_threads";
import { uploadAudioFile } from '../database/s3.js';
import { updateScriptChanges } from "../database/ddb.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

const elevenLabsApiKey = "sk_26d2102972203c110de41dc6ddb69d197e2896bb6feebe44";
const MalevoiceID = "cjVigY5qzO86Huf0OWal";
const FemaleVoiceId = "cgSgspJ2msm6clMCkdW9";
const elevenlabs = new ElevenLabsClient({
  apiKey: elevenLabsApiKey 
})


const lipSyncMessage = async (pid,i, j,k) => {
    const time = new Date().getTime();
    console.log(`Starting conversion for message ${k}${i}${j}`);
    const inputFilePath = `./public/audios/${pid}/dialog_${k}${i}${j}.mp3`;
    const outputFilePath = `./public/audios/${pid}/dialog_${k}${i}${j}.wav`
    await convertAudioFile(inputFilePath,outputFilePath);
    console.log(`Conversion done in ${new Date().getTime() - time}ms`);
    await execCommand(
      `bin\\rhubarb.exe -f json -o .\\public\\audios\\${pid}\\dialog_${k}${i}${j}.json .\\public\\audios\\${pid}\\dialog_${k}${i}${j}.wav -r phonetic`
    );
    console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
  };


  export const updateAudio = async (projectId,data) => {
    const {audioData,as: animationScript,changesList} = data;
    console.log("Creating audio");
   // let audioData = [];
    parentPort.postMessage("Running!");
    let count =0;

    for(let i=0;i<changesList.length;i++) {
        const sceneIndex = parseInt(changesList[i][0], 10);
        const scriptSpeechIndex = parseInt(changesList[i][1], 10);
        const speechArr = animationScript[sceneIndex].Script
        let SpeechAudioData = [];
        const isFemale = speechArr[scriptSpeechIndex].Speaker === "Michael" ? false : true;
        const dialogArr = speechArr[scriptSpeechIndex].Speech;
  
          for (let j = 0; j < dialogArr.length; j++) {
            const dialog = dialogArr[j].Text;
            console.log("Current DIalog: " + dialog);
            const fileName = `./public/audios/${projectId}/dialog_${sceneIndex}${scriptSpeechIndex}${j}.mp3`;

            const audio = await elevenlabs.generate({
              voice: isFemale?"Rachel":"Chris",
              text: dialog,
              model_id: "eleven_monolingual_v1"
            });

            const fileStream = createWriteStream(fileName);
            audio.pipe(fileStream);
            
            await lipSyncMessage(projectId,scriptSpeechIndex, j,sceneIndex);

            //await delay(5000);

            const currentAudioData = {
              audio: await audioFileToBase64(fileName),
              lipsync: await readJsonTranscript(
                `./public/audios/${projectId}/dialog_${sceneIndex}${scriptSpeechIndex}${j}.json`
              ),
            };
            parentPort.postMessage(`${changesList[i]} audio files updated!`)
            SpeechAudioData.push(currentAudioData);
          }
          audioData[sceneIndex][scriptSpeechIndex]= SpeechAudioData;
    }

      try{
        await uploadAudioFile(1,audioData);
        await updateScriptChanges(projectId, []);
      }
      catch(err)
      {
         process.exit(1);
      }
  };


  updateAudio("1", workerData);
