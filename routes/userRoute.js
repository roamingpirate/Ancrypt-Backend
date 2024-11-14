import express from 'express';
import { addNewProject, addNewUser, addProjectToUser, getOrCreateAvatarToken, getProjectList } from '../database/ddb.js';

const UserRouter = express.Router();
UserRouter.use(express.json());


UserRouter.post('/add/:userId', async (req,res) => {
    const userId = req.params.userId;
    try{
        const status = await addNewUser(userId);
        console.log(status);
        res.send({message:"success"});
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




export default UserRouter;