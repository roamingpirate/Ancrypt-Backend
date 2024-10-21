import { DynamoDBClient, UpdateItemCommand, GetItemCommand} from "@aws-sdk/client-dynamodb";
import dotenv from 'dotenv';
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
            'userId': {S : '1'},
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
            'userId': {S : '1'},
        }
    }
    try {
        const command = new GetItemCommand(params);
        const data = await ddb.send(command);
        if (data.Item) {
            console.log('Fetch succeeded:', data.Item);
            const changesList = data.Item.scriptChanges.L; 
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
            'userId': {S : '1'},
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
            'userId': {S : '1'},
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