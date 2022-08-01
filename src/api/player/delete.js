// ---------------------------------------------------------------------------------------------
// YOU CAN FREELY MODIFY THE CODE BELOW IN ORDER TO COMPLETE THE TASK
// ---------------------------------------------------------------------------------------------

import models from '../../db/model';

export default async (req, res) => {

  var playerID = (req.params.id).replace(':', '');  
  
  const player = await models.Player.findOne({ where: { id: playerID } });

  // Checking if player exists in db  
  if (player) {   
    // inspecting token  
    let token = req.headers.authorization;  
    if(token !== 'Bearer SkFabTZibXE1aE14ckpQUUxHc2dnQ2RzdlFRTTM2NFE2cGI4d3RQNjZmdEFITmdBQkE=') {    
      return res.status(403).send({
        message: 'No token provided! The selected player was protected with token.'
      });
    }
    
    await player.destroy();
  } else {
    return res.status(404).send({ message: `Invalid value for player id : ${playerID}` });
  }

  res.sendStatus(204);
  
}
