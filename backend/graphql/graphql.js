let { getAllJobs, getJob } = require('./classes/job');
let { Repository } = require('./classes/repository');
let graphqlHTTP = require('express-graphql');
let schema = require('./schema');

// noinspection JSUnusedGlobalSymbols
let root = {
  repository: ({owner, name}) => {
    return new Repository(owner, name);
  },
  jobs: () => {
    return getAllJobs();
  },
  job: ({jobName}) => {
    return getJob(jobName);
  }
};

module.exports = function(app) {
  app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  }));
};
