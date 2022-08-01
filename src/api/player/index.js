// ---------------------------------------------------------------------------------------------
// YOU CAN MODIFY THE CODE BELOW IN ORDER TO COMPLETE THE TASK
// YOU SHOULD NOT CHANGE THE EXPORTED VALUE OF THIS FILE
// ---------------------------------------------------------------------------------------------

import bodyParser from 'body-parser';

const bdparser = bodyParser.json();

export default (app) => {
  app.put(
    `/player/:id`, bdparser,
    require('./update').default
  );
  app.delete(
    `/player/:id`, 
    require('./delete').default
  );
  app.get(
    `/player`,
    require('./getList').default
  );
  app.post(
    `/player`, bdparser,
    require('./create').default
  );
};