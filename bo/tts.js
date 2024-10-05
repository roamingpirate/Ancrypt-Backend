//**working solution

// // @ts-ignore
// import { exec } from "child_process";
// import { ElevenLabsClient} from "elevenlabs";
// import ffmpeg from 'fluent-ffmpeg';
// import ffmpegPath from 'ffmpeg-static';
// //import voice from 'elevenlabs-node';
// import { promises as fs , createWriteStream} from "fs";

// // coverting format


//   const convertAudioFile = async (inputFile, outputFile) => {
//     ffmpeg.setFfmpegPath(ffmpegPath);
//     return new Promise((resolve, reject) => {
//       ffmpeg(inputFile)
//         .toFormat('wav')
//         .on('end', () => {
//           console.log('Conversion finished successfully');
//           resolve(outputFile);
//         })
//         .on('error', (err) => {
//           console.error('Error during conversion:', err.message);
//           reject(err);
//         })
//         .save(outputFile);
//     });
//   };

//    // Executing External commands
//   const execCommand = (command) => {
//         return new Promise((resolve, reject) => {
//         exec(command, (error, stdout, stderr) => {
//             if (error) reject(error);
//             resolve(stdout);
//         });
//         });
//     };

//   // Reading Lipsync file 
//   const readJsonTranscript = async (file) => {
//     const data = await fs.readFile(file, "utf8");
//     return JSON.parse(data);
//   };
  
//   // Coverting audiofile to text 
//   const audioFileToBase64 = async (file) => {
//     const data = await fs.readFile(file);
//     return data.toString("base64");
//   };

// const elevenLabsApiKey = "sk_43c3fd75226a799512600015838c07a48fb0146ffc9b2da1";
// const MalevoiceID = "cjVigY5qzO86Huf0OWal";
// const FemaleVoiceId = "cgSgspJ2msm6clMCkdW9";
// const elevenlabs = new ElevenLabsClient({
//   apiKey: elevenLabsApiKey 
// })


// const lipSyncMessage = async (pid,i, j,k) => {
//     const time = new Date().getTime();
//     console.log(`Starting conversion for message ${k}${i}${j}`);
//     const inputFilePath = `./public/audios/${pid}/dialog_${k}${i}${j}.mp3`;
//     const outputFilePath = `./public/audios/${pid}/dialog_${k}${i}${j}.wav`
//     await convertAudioFile(inputFilePath,outputFilePath);
//     // await execCommand(
//     //   `ffmpeg -y -i ./public/audios/${pid}/dialog_${k}${i}${j}.mp3 ./public/audios/${pid}/dialog_${k}${i}${j}.wav`
//     //   // -y to overwrite the file
//     // );
//     console.log(`Conversion done in ${new Date().getTime() - time}ms`);
//     await execCommand(
//       `bin\\rhubarb.exe -f json -o .\\public\\audios\\${pid}\\dialog_${k}${i}${j}.json .\\public\\audios\\${pid}\\dialog_${k}${i}${j}.wav -r phonetic`
//     );
//     // -r phonetic is faster but less accurate
//     console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
//   };


//   export const createAudio = async (projectId,animationScript) => {
//     console.log("Creating audio");
//     let audioData = [];

//     for(let k=0;k< animationScript.length;k++){

//     const speechArr = animationScript[k].Script;
//     let SceneaudioData = [];
//     for (let i = 0; i < speechArr.length; i++) {
  
//       let SpeechAudioData = [];
//       const isFemale = speechArr[i].Speaker === "Michael" ? false : true;
//       const dialogArr = speechArr[i].Speech;
  
//       for (let j = 0; j < dialogArr.length; j++) {
//         const dialog = dialogArr[j].Text;
//         console.log("Current DIalog: " + dialog);
//         const fileName = `./public/audios/${projectId}/dialog_${k}${i}${j}.mp3`;

//         const audio = await elevenlabs.generate({
//           voice: isFemale?"Rachel":"Chris",
//           text: dialog,
//           model_id: "eleven_monolingual_v1"
//         });

//         const fileStream = createWriteStream(fileName);
//         audio.pipe(fileStream);
        
//         // await voice.textToSpeech(
//         //   elevenLabsApiKey,
//         //   isFemale ? FemaleVoiceId : MalevoiceID,
//         //   fileName,
//         //   dialog
//         // );
//         await lipSyncMessage(projectId,i, j,k);
//         const currentAudioData = {
//           audio: await audioFileToBase64(fileName),
//           lipsync: await readJsonTranscript(
//             `./public/audios/${projectId}/dialog_${k}${i}${j}.json`
//           ),
//         };
//         SpeechAudioData.push(currentAudioData);
//       }
//       SceneaudioData.push(SpeechAudioData);
//     } 
//         audioData.push(SceneaudioData);
//     }
  
  
//     const jsonString = JSON.stringify(audioData, null, 2);
  
//     try {
//      // await fs.writeFile("audioData.json", jsonString);
//       console.log("File has been saved!");
//     } catch (err) {
//       console.error("Error writing file:", err);
//     }
  
//     console.log("pello");
//   };