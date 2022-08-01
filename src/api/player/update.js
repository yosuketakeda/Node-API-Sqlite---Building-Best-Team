// ---------------------------------------------------------------------------------------------
// YOU CAN FREELY MODIFY THE CODE BELOW IN ORDER TO COMPLETE THE TASK
// ---------------------------------------------------------------------------------------------

import models from '../../db/model';

export default async (req, res) => {
  /**     
    used Postman for put 
  **/  

  var playerID = (req.params.id).replace(':', '');
  var body = req.body;    

  const player = await models.Player.findOne({ where: { id: playerID } });
    
  // Checking if player exists in db
  if (player) {
    // inspecting position between old field and new field
    if (player.position !== body.position) {
      return res.status(404).send({ message: `Invalid value for player id ${playerID}'s position: : ${body.position}` });
    }

    await player.update({
      name : body.name,
      position: body.position
    });

  } else {
    return res.status(404).send({ message: `Invalid value for player id : ${playerID}` });
  }

  var newPlayerSkills = body.playerSkills;
  var oldPlayerSkills = await models.PlayerSkill.findAll({ where: { playerId: playerID } });  
    
  let buffer = [];    

  for(let i=0; i<newPlayerSkills.length; i++) {
    // inspecting skill value between old and new
    if(oldPlayerSkills[i].dataValues.skill !== newPlayerSkills[i].skill) {
      return res.status(404).send({ message: `Invalid value for player id ${playerID}'s skill : ${newPlayerSkills[i].skill}` });
    }

    await models.PlayerSkill.update({
      skill: newPlayerSkills[i].skill, 
      value: newPlayerSkills[i].value
    }, {
      where: {
        playerId: playerID,
        id: oldPlayerSkills[i].dataValues.id
      }
    });

    // player skills for res 
    buffer.push({
      id: oldPlayerSkills[i].dataValues.id,
      skill: newPlayerSkills[i].skill, 
      value: newPlayerSkills[i].value,
      playerId: playerID
    });
     
  }

  // updated player for res 
  var updatedPlayer = {
    id: playerID,
    name: body.name,
    position: body.position,
    playerSkills: buffer
  }  

  res.status(200).send(updatedPlayer);
}
