// ---------------------------------------------------------------------------------------------
// YOU CAN FREELY MODIFY THE CODE BELOW IN ORDER TO COMPLETE THE TASK
// ---------------------------------------------------------------------------------------------

import models from '../../db/model';

export default async (req, res) => {

  const players = await models.Player.findAll();
  var playersArr = [];

  for(let i=0; i<players.length; i++) {
    let data = players[i].dataValues;     
    let buffer = [];
    let skills = await models.PlayerSkill.findAll({ where: { playerId: data.id } });
    for(let j=0; j<skills.length; j++) {
      let buf = skills[j].dataValues;
      buffer.push(buf);
    }
    let temp = {
      ...data,
      playerSkills: buffer
    }

    playersArr.push(temp);
  }
  
  res.status(200).send(playersArr);
}
