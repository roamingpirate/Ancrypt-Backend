import express from 'express';
import { addNewProject, addNewUser, addProjectToUser, addUserRequest, fetchIsNewStatus, getOrCreateAvatarToken, getProjectList, isBetaApproved, setIsNewToFalse } from '../database/ddb.js';

const UserRouter = express.Router();
UserRouter.use(express.json());


UserRouter.post('/add/:userId', async (req,res) => {
    const userId = req.params.userId;
    console.log("man")
    try{
        const status = await addNewUser(userId);
        console.log(status);
        const resp = await isBetaApproved(userId);
        res.send({status : resp});
    }
    catch(error){
        res.send({message:"error"});
    }
});

UserRouter.post('/request/:userId/:userName', async (req,res) => {
    const userId = req.params.userId;
    const userName = req.params.userName;

    try{
        const status = await addUserRequest(userId,userName);
        res.send({status : status.toString()});
    }
    catch(error){
        res.send({message:"error"});
    }
});


UserRouter.post('/:userId/add/:projectName', async (req,res) => {
    const userId = req.params.userId;
    const projectName = req.params.projectName;
    try{
        const status = await addProjectToUser(userId, projectName);
        console.log(status);
        res.send(status);
    }
    catch(error){
        res.send({message:"error"});
    }
});


UserRouter.get('/:userId/projects', async (req, res) => {
    const userId = req.params.userId;

    try {
        const projectList = await getProjectList(userId);
        res.send({ projectList });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "error" });
    }
});

UserRouter.get('/:userId/avatarToken', async (req, res) => {
    const userId = req.params.userId;

    try {
        const token = await getOrCreateAvatarToken(userId);
        res.send({token});
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "error" });
    }
});

UserRouter.get('/status/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const status = await fetchIsNewStatus(userId);
        console.log("Fetch status response:", status);
        res.send(status); 
    } catch (error) {
        console.error("Error fetching isNew status:", error);
        res.status(500).send({ message: "Error fetching isNew status" });
    }
});

UserRouter.post('/setIsNewFalse/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const result = await setIsNewToFalse(userId);
        console.log("Set isNew to false response:", result);
        res.send({ message: "isNew set to false successfully", result });
    } catch (error) {
        console.error("Error setting isNew to false:", error);
        res.status(500).send({ message: "Error setting isNew to false" });
    }
});





export default UserRouter;