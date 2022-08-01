// /////////////////////////////////////////////////////////////////////////////
// PLEASE DO NOT MODIFY, RENAME OR REMOVE ANY OF THE CODE BELOW. 
// ALSO DO NOT CHANGE THE EXPORTED VALUE OF THIS FILE
// YOU CAN ADD YOUR CODE TO THIS FILE AND USE THEM IN YOUR WORK.
// /////////////////////////////////////////////////////////////////////////////

const { Op } = require('sequelize');
import models from '../../db/model';

export default async (req, res) => {

  const requirements = req.body;

  /**
   * When check whether there is only one skill per position or not. 
   * if duplicated, guessed that mainSkill value will be array.
   * if not array, when duplicated JSON keys are posted, node will accept only the last key value.
  
    ex:  
    - if JSON is below,
      [
        {
          "position": "midfielder",
          "mainSkill": "speed",
          "mainSkill": "strength",
          "numberOfPlayers": 1
        }
      ]
      
      node accepts only last mainSKill's value "strength". It is wrong for us.

    So,
    - right duplicated value for post;
      [
        {
          "position": "midfielder",
          "mainSkill": ["speed", "strength"],
          "numberOfPlayers": 1
        }
      ]    
  */

  var positions = [];
  var bestPlayers = [];
  var bestPlayerIDs = [];
  
  for(let i=0; i<requirements.length; i++) {
    // checking repeated position
    positions.push(requirements[i].position);    
    let buf = positions.filter((item, index) => positions.indexOf(item) !== index);  
    if(buf.length > 0) {
      return res.status(400).send({ message: `Invalid repeated position : ${buf}` });
    }

    // checking duplicated skill 
    if(typeof requirements[i].mainSkill !== 'string') {
      return res.status(400).send({ message: `Invalid duplicated skills for position ${requirements[i].position}: ${requirements[i].mainSkill}` });
    }

    // checking the available number of required position
    var positionBuf = await models.Player.findAll({ where: { position: requirements[i].position }});    
    if(positionBuf.length < requirements[i].numberOfPlayers) {
      return res.status(400).send({ message: `Insufficient number of players for position: ${requirements[i].position}` });
    }
    
    // Searching skills for available position
    var skillBuf = [];     
    for(let j=0; j<positionBuf.length; j++) {
      let buffer = await models.PlayerSkill.findAll({ 
        where: { 
          playerId: positionBuf[j].dataValues.id,
          skill: requirements[i].mainSkill
        } 
      });
      
      if(buffer.length > 0) {
        for(let k=0; k<buffer.length; k++) {
          // available playerSkills for required position & skill
          skillBuf.push(buffer[k].dataValues);     
        }        
      } else {
        // Though there is available position, there is no available skill
        let buffer2 = await models.PlayerSkill.findAll({ 
          where: { 
            playerId: positionBuf[j].dataValues.id,
            skill: {
              [Op.ne]: requirements[i].mainSkill   // finding negative skill
            }
          } 
        });
        for(let f=0; f<buffer2.length; f++) {
          skillBuf.push(buffer2[f].dataValues);
        }
      }
    }

    /***************
      Now, getting players with required number for one position & one skill.
      
      For doing this, while repeated loop by required number, getting the maximum element per loop and removing got value in array. 
      So, got new array without old maximum element per loop. 
      In a word, could get the maximum element per loop with dynamic array. 
    */
    
    for(let n=0; n<requirements[i].numberOfPlayers; n++) {  
      let max=0, playerID=0, max_index=0; 
      for(let s=0; s<skillBuf.length; s++) {
        // checking in player id whether current player was already putted in best player array
        if(bestPlayerIDs.indexOf(skillBuf[s].playerId) > 0) {
          continue;
        }
        // if new player outside best player array
        if(s == 0) {
          max = skillBuf[s].value;
          playerID = skillBuf[s].playerId;
          max_index = s; 
        } else {
          if(skillBuf[s].value > max) {
            max = skillBuf[s].value;
            playerID = skillBuf[s].playerId;
            max_index = s;            
          }
        }
      }

      // putting the gotten max element into best player array
      for(let r=0; r<positionBuf.length; r++) {
        if(positionBuf[r].dataValues.id === playerID) { 
          bestPlayerIDs.push(playerID);
          let skills = [
            {
              skill: skillBuf[max_index].skill,
              value: skillBuf[max_index].value
            }
          ];

          let best = {
            name: positionBuf[r].dataValues.name,
            position: positionBuf[r].dataValues.position,
            playerSkills: skills
          };

          bestPlayers.push(best);
        }
      }
      skillBuf.splice(max_index, 1); // removing maximum element
    }        
  }

  res.status(200).send(bestPlayers);
}
