import express from 'express';
const VideoRouter = express.Router();
VideoRouter.use(express.json());
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import { uploadVideo } from '../database/s3.js';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

VideoRouter.post('/create/:projectId', upload.single('video'), async (req, res) => {
    try {
        
        if (!req.file) {
            return res.status(400).send('No video file uploaded');
        }

        const videoBuffer = req.file.buffer;
        const projectId = req.params.projectId;  // Using params for projectId instead of query
        const videoId = uuidv4();

            // Use a relative path from the project root
            const tempDir = path.join('tmp'); // Relative to the root of your project

            // Create the directory if it doesn't exist
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

        // Save the incoming buffer to a temporary .webm file
        const tempWebmPath = path.join(tempDir, `${videoId}.webm`);
        fs.writeFileSync(tempWebmPath, videoBuffer);

        const outputPath = path.join(tempDir, `${videoId}.mp4`);

        // Convert the .webm file to .mp4 using ffmpeg
        await new Promise((resolve, reject) => {
            ffmpeg(tempWebmPath)
                .output(outputPath)
                .videoCodec('libx264')
                .audioCodec('aac')
                .outputFormat('mp4')
                .videoFilters('scale=900:1124')  
                .on('end', resolve)
                .on('error', (err, stdout, stderr) => {
                    console.error('FFmpeg error:', err);
                    console.error('FFmpeg stderr:', stderr);
                    reject(err);
                })
                .run();
        });
        
        // Upload the converted video to S3
        const videoKey = `${projectId}/video/${videoId}.mp4`;
        const uploadResult = await uploadVideo(videoKey, fs.readFileSync(outputPath));

        // Cleanup temporary files
        fs.unlinkSync(tempWebmPath);
        fs.unlinkSync(outputPath);

        const videoURL = `https://ancript-videos.s3.amazonaws.com/${videoKey}`;
        return res.status(200).json({ videoURL });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Error processing the video');
    }
});

export default VideoRouter;
