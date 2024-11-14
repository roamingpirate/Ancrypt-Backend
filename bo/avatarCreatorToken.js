import axios from 'axios'

const AvatarCreatorToken = async () => {
    try {
      const response = await axios.post('https://ancript.readyplayer.me/api/users', {});
      
      // Extracting the token from the response data
      const token = response.data?.data?.token;
      console.log('Token:', token);
      return token;
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
    }
  };

const draftAvatar = async (token, id) => {
    try {
        const response = await axios({
            method: 'POST',
            url: `https://api.readyplayer.me/v2/avatars/templates/${id}`,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            data: {
              data: {
                partner: 'ancript',
                bodyType: 'fullbody'
              }
            }
          });

          console.log('Response:', response.data);
          return response.data.data.id;
    }
    catch(error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

const putAvatar = async (token,id) => {
    try{
            const response = await axios({
                method: 'PUT',
                url: `https://api.readyplayer.me/v2/avatars/${id}`,
                headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                },
            });

            console.log('Response:', response.data);
            return response.data.data.id;
        }
        catch(error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        } 
}

const equipAvatarAsset = async (token, avatarId, assetId) => {
    try {
      const response = await axios({
        method: 'PUT',
        url: `https://api.readyplayer.me/v1/avatars/${avatarId}/equip`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {
          data: {
            assetId: assetId
          }
        }
      });
  
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
    }
  };

export const GetavatarCreatorToken = async () => {
    const token = await AvatarCreatorToken();
    //female avatar 
    const fdraftavatarId = await draftAvatar(token,'645cd1d5f23d0562d3f9d28e');
    const fputAvatar = await putAvatar(token, fdraftavatarId);
    console.log(fdraftavatarId,"id");
    await equipAvatarAsset(token,fdraftavatarId,'146120116') 

    // male avatar
    const mdraftavatarId = await draftAvatar(token,'65bf79dafdc09570c48952ac');
    const mputAvatar = await putAvatar(token, mdraftavatarId);
    console.log(token);
    return token;
}