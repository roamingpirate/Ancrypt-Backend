import { exec } from "child_process";
import { ElevenLabsClient} from "elevenlabs";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { promises as fs , createWriteStream} from "fs";

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

const elevenLabsApiKey = "sk_9c8eabbb80bf29b28bdb810cc34451e8a9754fbbe2ee3dea";
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


  export const createAudio = async (projectId,animationScript) => {
    console.log("Creating audio");
    let audioData = [];

    for(let k=0;k<animationScript.length;k++){
        const speechArr = animationScript[k].Script;
        let SceneaudioData = [];
            for (let i = 0; i < speechArr.length; i++) {
                let SpeechAudioData = [];
                const isFemale = speechArr[i].Speaker === "Michael" ? false : true;
                const dialogArr = speechArr[i].Speech;
          
                  for (let j = 0; j < dialogArr.length; j++) {
                    const dialog = dialogArr[j].Text;
                    console.log("Current DIalog: " + dialog);
                    const fileName = `./public/audios/${projectId}/dialog_${k}${i}${j}.mp3`;

                    const audio = await elevenlabs.generate({
                      voice: isFemale?"Rachel":"Chris",
                      text: dialog,
                      model_id: "eleven_monolingual_v1"
                    });

                    const fileStream = createWriteStream(fileName);
                    audio.pipe(fileStream);
                    
                    await lipSyncMessage(projectId,i, j,k);

                    const currentAudioData = {
                      audio: await audioFileToBase64(fileName),
                      lipsync: await readJsonTranscript(
                        `./public/audios/${projectId}/dialog_${k}${i}${j}.json`
                      ),
                    };

                    SpeechAudioData.push(currentAudioData);
                  }
              SceneaudioData.push(SpeechAudioData);
            } 
            audioData.push(SceneaudioData);
    }
  
   console.log("pello");
    return audioData;
  
   
  };