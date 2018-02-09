let { buildSchema } = require('graphql');
let { schema_Test } = require('./classes/test');
let { schema_Build } = require('./classes/build');
let { schema_Job } = require('./classes/job');
let { schema_Repository } = require('./classes/repository');
let { schema_PullRequest } = require('./classes/pullRequest');

let schemas = [];
schemas.push(schema_Test);
schemas.push(schema_Build);
schemas.push(schema_Job);
schemas.push(schema_Repository);
schemas.push(schema_PullRequest);
schemas.push(`
type Query {    
  repository(owner: String!, name: String!): Repository
  jobs: [Job]
  job(jobName: String): Job
}
type Mutation{
  syncJobSettingFromJenkins(name: String!): Job
}
`);

let schema = buildSchema(schemas.join());

module.exports = schema;
