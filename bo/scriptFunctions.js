import animationScriptGenerator from "../api/animationScriptGenerator.js"

export const createAnimationScript = async (scriptData) => {
    const scenes = scriptData.scenes;
  
    const promises = scenes.map(scene => 
      animationScriptGenerator({ script: scene.script })
        .then(sceneAnimationScript => JSON.parse(sceneAnimationScript))
    );
  
    const animationScript = await Promise.all(promises);
  
    return animationScript;
};
  

