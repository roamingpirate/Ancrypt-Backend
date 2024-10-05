import animationScriptGenerator from "../api/animationScriptGenerator.js"



export const createAnimationScript = async (scriptData) => {

    const scenes = scriptData.scenes;
     
    const animationScript = [];
    for(let i=0;i<scenes.length;i++){
        //console.log(scenes[i].script); 
        const sceneAnimationScript = await animationScriptGenerator({Script : scenes[i].script});
       // console.log(JSON.parse(sceneAnimationScript));
        animationScript.push(JSON.parse(sceneAnimationScript));
    }
    return animationScript;
}