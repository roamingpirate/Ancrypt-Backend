import { DynamoDBClient, UpdateItemCommand, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import dotenv from 'dotenv';
import { GetavatarCreatorToken } from "../bo/avatarCreatorToken.js";
dotenv.config();

const ddb = new DynamoDBClient({
    region: process.env.DDBBUCKET_REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_KEY
    }
  });

export const updateScriptChanges = async (projectId, scriptChanges) => {
    const params = {
        TableName : 'ankryptProjects',
        Key: {
            'projectId': {S : projectId},
        },
        UpdateExpression: 'SET scriptChanges = :scriptChange',
        ExpressionAttributeValues: {
            ':scriptChange': { L : scriptChanges.map(change => ({ S: change.toString() })) }
        },
        ReturnValues: 'UPDATED_NEW'
    }


    try {
        const command = new UpdateItemCommand(params);
        const data = await ddb.send(command);
        console.log('Update succeeded:', data);
      } catch (err) {
        console.error('Update failed:', err);
      }
}


export const getScriptChanges = async (projectId) => {
    const params = {
        TableName : 'ankryptProjects',
        Key: {
            'projectId': {S : projectId},
        }
    }
    try {
        const command = new GetItemCommand(params);
        const data = await ddb.send(command);
        if (data.Item) {
            console.log('Fetch succeeded:', data.Item);
            const changesList = data.Item?.scriptChanges?.L || []; 
            const formattedChangesList = changesList.map((item) => item.S);
            console.log(formattedChangesList);
            return formattedChangesList;
        } else {
            console.log('Item not found');
            return [];
        }
    } catch (err) {
        console.error('Fetch failed:', err);
        throw err;
    }
}


export const updateBackgroundImageStatus = async (projectId, status) => {
    const params = {
        TableName : 'ankryptProjects',
        Key: {
            'projectId': {S : projectId.toString()},
        },
        UpdateExpression: 'SET backgroundStatus = :bs',
        ExpressionAttributeValues: {
            ':bs': { N : status.toString() }
        },
        ReturnValues: 'UPDATED_NEW'
    }


    try {
        const command = new UpdateItemCommand(params);
        const data = await ddb.send(command);
        console.log('Update succeeded:', data);
      } catch (err) {
        console.error('Update failed:', err);
      }
}


export const getBackgroundImageStatus = async (projectId) => {
    const params = {
        TableName : 'ankryptProjects',
        Key: {
            'projectId': {S : projectId.toString()},
        }
    }
    try {
        const command = new GetItemCommand(params);
        const data = await ddb.send(command);
        if (data.Item) {
            console.log('Fetch succeeded:', data.Item);
            const status = data.Item.backgroundStatus.N;
            console.log('Status:', status);
            return status;
        } else {
            console.log('Item not found');
            return [];
        }
    } catch (err) {
        console.error('Fetch failed:', err);
        throw err;
    }
}


export const addNewUser = async (userId) => {
    const item = {
        userId: { S: userId.toString() },
        projectList: { L: [] },
    };

    try {
        const getCommand = new GetItemCommand({
            TableName: "userInfo",
            Key: {
                userId: { S: userId.toString() },
            },
        });

        const existingUser = await ddb.send(getCommand);

        if (existingUser.Item) {
            console.log("User already exists");
            return "User already exists";
        }

        const putCommand = new PutItemCommand({
            TableName: "userInfo",
            Item: item,
        });
        await ddb.send(putCommand);
        console.log("User added");
        return "success";
    } catch (err) {
        console.error('Failed to add user:', err);
        throw err;
    }
};

export const fetchIsNewStatus = async (userId) => {
  try {
      const getCommand = new GetItemCommand({
          TableName: "userInfo",
          Key: {
              userId: { S: userId.toString() },
          },
      });

      const result = await ddb.send(getCommand);

      // If user is not found, return an error or a different response
      if (!result.Item) {
          console.log("User not found");
          return { status: 0, message: "User not found" };
      }

      // Check if `isNew` is present and handle its value
      if (result.Item.hasOwnProperty("isNew")) {
          const isNewValue = result.Item.isNew.BOOL;
          return { status: isNewValue ? 1 : 0 };
      }

      // If `isNew` is not present, treat as `status: 1`
      return { status: 1 };
  } catch (err) {
      console.error("Error fetching isNew status:", err);
      throw err;
  }
};

export const setIsNewToFalse = async (userId) => {
  try {
      const updateCommand = new UpdateItemCommand({
          TableName: "userInfo",
          Key: {
              userId: { S: userId.toString() },
          },
          UpdateExpression: "SET isNew = :falseValue",
          ExpressionAttributeValues: {
              ":falseValue": { BOOL: false },
          },
      });

      await ddb.send(updateCommand);
      console.log("isNew set to false successfully");
      return "success";
  } catch (err) {
      console.error("Failed to set isNew to false:", err);
      throw err;
  }
};

export const isBetaApproved = async (userId) => {
   try {
      const getCommand = new GetItemCommand({
          TableName: "betaApprovedUsers",
          Key: {
              userId: { S: userId.toString() },
          },
      });

      const isBetaApprovedUser = await ddb.send(getCommand);

      if (isBetaApprovedUser.Item) {
          console.log("User Beta Approved");
          return 1;
      }

      console.log("User Not Beta Approved");
      return 0;

    } catch (err) {
        console.error('Failed to add user:', err);
        throw err;
    }
}

export const addUserRequest = async (userId, userName) => {
        const item = {
          userId: { S: userId.toString() },
          name: { S: userName.toString() },
      };

      try {
        const getCommand = new GetItemCommand({
          TableName: "userRequest",
          Key: {
              userId: { S: userId.toString() },
          },
      });

        const existingUser = await ddb.send(getCommand);

        if (existingUser.Item) {
            console.log("User request already exists");
            return 0;
        }

        const putCommand = new PutItemCommand({
            TableName: "userRequest",
            Item: item,
        });
        await ddb.send(putCommand);
        console.log("User  request added");
        return 1;
    } catch (err) {
        console.error('Failed to add user:', err);
        throw err;
    }

}

export const addProjectToUser = async (userId, projectName) => {
    try {
      const getItemCommand = new GetItemCommand({
        TableName: "userInfo",
        Key: {
          userId: { S: userId.toString() },
        },
        ProjectionExpression: "projectList",
      });
      
      const data = await ddb.send(getItemCommand);
      const projectList = data.Item?.projectList?.L || [];
      const newIndex = projectList.length;
      const projectNo = `ancript_${newIndex + 1}`;
      const projectId = userId+"_"+projectNo;
  
      const project = {
        M: {
          projectName: { S: projectName },
          projectId: { S: projectId.toString() },
          projectNo: { S: projectNo }
        }
      };
  
      const updateCommand = new UpdateItemCommand({
        TableName: "userInfo",
        Key: {
          userId: { S: userId.toString() },
        },
        UpdateExpression: "SET projectList = list_append(projectList, :newProject)",
        ExpressionAttributeValues: {
          ":newProject": { L: [project] },
        },
        ReturnValues: "UPDATED_NEW",
      });

      await addNewProject(projectId,userId, projectName)
  
      const updateResult = await ddb.send(updateCommand);
      console.log("Project added to user:", updateResult);
      return projectNo;
    } catch (err) {
      console.error("Failed to add project to user:", err);
      throw err;
    }
};


export const getProjectList = async (userId) => {
    try {
      const command = new GetItemCommand({
        TableName: "userInfo",
        Key: {
          userId: { S: userId.toString() },
        },
        ProjectionExpression: "projectList",
      });
  
      const data = await ddb.send(command);
      const projectList = data.Item?.projectList?.L || []; 

      const simplifiedProjectList = projectList.map(item => ({
        projectName: item.M.projectName.S,
        projectId: item.M.projectId.S,
        projectNo: item.M.projectNo?.S ? item.M.projectNo.S : undefined
      }));
  
      return simplifiedProjectList;
    } catch (err) {
      console.error("Failed to fetch project list:", err);
      throw err;
    }
  };

  export const getOrCreateAvatarToken = async (userId) => {
    try {
      const getCommand = new GetItemCommand({
        TableName: "userInfo",
        Key: {
          userId: { S: userId.toString() },
        },
        ProjectionExpression: "avatarCreationToken",
      });
  
      const data = await ddb.send(getCommand);
      const token = data.Item?.avatarCreationToken?.S;
  
      if (token) {
        return token;
      }
  
      const newToken = await GetavatarCreatorToken();
  
      const updateCommand = new UpdateItemCommand({
        TableName: "userInfo",
        Key: {
          userId: { S: userId.toString() },
        },
        UpdateExpression: "SET avatarCreationToken = :newToken",
        ExpressionAttributeValues: {
          ":newToken": { S: newToken },
        },
        ReturnValues: "UPDATED_NEW",
      });
  
      await ddb.send(updateCommand);
  
      return newToken;
    } catch (err) {
      console.error("Failed to fetch or create avatar creation token:", err);
      throw err;
    }
  };

  export const addNewProject = async (projectId, userId, projectName) => {
    const item = {
        projectId: { S: projectId.toString() },
        userId: { S: userId.toString() },
        projectName : { S: projectName.toString() }
    };

    try {
        const getCommand = new GetItemCommand({
            TableName: "ankryptProjects",
            Key: {
                projectId: { S: projectId.toString() },
            },
        });

        const existingProject = await ddb.send(getCommand);

        if (existingProject.Item) {
            console.log("Project already exists");
            return "Project already exists";
        }

        const putCommand = new PutItemCommand({
            TableName: "ankryptProjects",
            Item: item,
        });

        await ddb.send(putCommand);
        console.log("Project added");
        return "success";
    } catch (err) {
        console.error('Failed to add project:', err);
        throw err;
    }
};


export const fetchProjectDetails = async (userId, projectNo) => {
  console.log('Fetching project details');
    try {
      const projectId = `${userId}_${projectNo}`;
      console.log(projectId);
        const command = new GetItemCommand({
            TableName: "ankryptProjects",
            Key: {
                projectId: { S: projectId }
            }
        });

        const data = await ddb.send(command);
        console.log(data);

        if (!data.Item) {
            return { status: 0, message: 'table not present' };
        }

        const projectName = data.Item.projectName ? data.Item.projectName.S : null;

        return { status: 1, projectName};
    } catch (err) {
        console.error("Failed to fetch project details:", err);
        throw err;
    }
};