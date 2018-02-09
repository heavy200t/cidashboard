let pg = require('../../database/postgres');
let utils = require('../../utils/commonUtils');
let {Build} = require('./build');
let {Repository} = require('./repository');
let {GraphQLError} = require('graphql');

let schema_Job = `  type Job {
    name: String!
    url: String
    phase: String
    isRunning: Boolean
    lastUpdTime: String
    latestBuild: Build
    result: String   
    builds(startDate: String, endDate: String): [Build]
    build(buildId: Int): Build
    repository: Repository
 }`;

class Job {
  constructor(job) {
    if (job !== undefined){
      this.name = job.name.trim();
      this.url = job.url===undefined?'':job.url.trim();
      this.phase = job.phase;
      this.running = job.running;
      this._latestBuild = job.latestBuild;
      this.lastUpdTime = job.lastUpdTime;
      this.result = job.result;
      this.gitProject = job.gitProject;
      this.gitRepository = job.gitRepository
    }
  }

  async builds({startDate, endDate}) {
    let ret = [];
    let cond = [{field: 'jobName', op: '=', value: this.name}];
    cond = cond.concat(utils.timeCondition_pg('startTime', startDate, endDate));
    let builds = await pg.select('builds', cond);
    builds.forEach(b => ret.push(new Build(b).aggregate()));
    return ret;
  }

  async latestBuild() {
    let b = (await pg.select('builds', [
      {field: 'jobName', op: '=', value: this.name},
      {field: 'buildId', op: '=', value: this._latestBuild}
    ]))[0];
    return new Build(b).aggregate();
  }

  // noinspection JSUnusedGlobalSymbols
  async build({buildId}) {
    let b = (await pg.select('builds', [
      {field: 'jobName', op: '=', value: this.name},
      {field: 'buildId', op: '=', value: buildId}
    ]))[0];
    return new Build(b).aggregate();
  }


  async repository() {
    let res = {};
    if (this.gitProject===undefined || this.gitRepository===undefined ) {
      try{
        res = (await utils.queryJenkinsSetting(this.url));
      } catch (e) {
        throw new GraphQLError(e);
      }
      let parameters = res.actions
        .find(i => i._class==='hudson.model.ParametersDefinitionProperty').parameterDefinitions;
      this.gitProject = parameters.find(i => i.name === 'GIT_PROJECT')
        .defaultParameterValue.value;
      this.gitRepository = parameters.find(i => i.name === 'GIT_REPOSITORY')
        .defaultParameterValue.value;
    }
    pg.upsertJob(this);
    return new Repository(this.gitProject, this.gitRepository);
  }
}

let getJob = async function (name) {
  let jobs = [];
  try {
    jobs = (await pg.select('jobs', [{field: 'name', op: '=', value: name}]));
  } catch (e){
    throw new GraphQLError(e);
  }
  if (jobs.length === 0) {
    throw new GraphQLError({message: "Could not resolve to a Job with the name '{0}'.".format(name)})
  }
  return new Job(jobs[0]);
};

let getAllJobs = async function () {
  let ret = [];
  jobs = (await pg.select('jobs', [], ['name']));
  jobs.forEach(j => {ret.push(new Job(j))});
  return ret;
};

// noinspection JSUnusedGlobalSymbols
module.exports = {Job, schema_Job, getAllJobs, getJob};
