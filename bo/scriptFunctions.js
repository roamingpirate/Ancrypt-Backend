import animationScriptGenerator from "../api/animationScriptGenerator.js"



export const createAnimationScript = async (scriptData) => {

    const scenes = scriptData.scenes;
     
    const animationScript = [];
    for(let i=0;i<scenes.length;i++){
        //console.log(scenes[i].script); 
        const sceneAnimationScript = await animationScriptGenerator({"script" : scenes[i].script});
        console.log(JSON.parse(sceneAnimationScript),"huhu");
        animationScript.push(JSON.parse(sceneAnimationScript));
    }
   // const scriptDataa = {"scenes": scenes};
   // let animationScript = await animationScriptGenerator(scriptDataa);
    //console.log(animationScript);
    //animationScript = animationScript.replace(/\\"/g, '"');
    //let res= JSON.parse(animationScript);
    return animationScript;
}