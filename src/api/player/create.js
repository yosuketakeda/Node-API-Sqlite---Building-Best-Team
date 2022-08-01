// ---------------------------------------------------------------------------------------------
// YOU CAN FREELY MODIFY THE CODE BELOW IN ORDER TO COMPLETE THE TASK
// ---------------------------------------------------------------------------------------------

import models from '../../db/model';

export default async (req, res) => {
  /**     
    used Postman for test  
  **/ 
  
  var body = req.body;  

  var basicInfo = {
    name: body.name,
    position: body.position,    
  }  
 
  const newPlayer = await models.Player.create(basicInfo);

  if(!newPlayer) {
    return res.status(500).send({ message: `Failed player creation : ${err}` });
  }

  // getting new player ID
  var playerID = await models.Player.count();

  // create player skills in PlayerSkills Table
  var playerSkills = body.playerSkills;   
 
  for(let i=0; i<playerSkills.length; i++) {    
    // create values in PlayerSkills Table
    await models.PlayerSkill.create({ 
      skill: playerSkills[i].skill, 
      value: playerSkills[i].value, 
      playerId: playerID
    }).catch( err => {
      return res.status(500).send({ message: `Failed player skill creation : ${err}` });
    });
  }

  // created player for res      
  let buffer = [];          // player skills for res
  let skills = await models.PlayerSkill.findAll({ where: { playerId: playerID } });  
  
  for(let i=0; i<skills.length; i++) {
    let buf = skills[i].dataValues;
    buffer.push(buf);
  }

  var player = {
    id: playerID,
    ...basicInfo,
    playerSkills: buffer
  }
  
  res.status(200).send(player);
}
