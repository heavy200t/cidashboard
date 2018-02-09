let pg = require('../../database/postgres');
let github = require('../../database/gitHub');
let {Test} = require('./test');
let {PullRequest} = require('./pullRequest');
let utils = require('../../utils/commonUtils');
let {GraphQLError} = require('graphql');

let schema_Build = `
type Build {
  jobName: String
  buildId: Int
  startTime: String
  url: String
  result: String
  building: Boolean
  description: String
  duration: Float  
  total: Int
  fail: Int
  pass: Int
  unstable: Int
  fail_percent: Float
  pass_percent: Float
  unstable_percent: Float
  tests: [Test]
  test(className: String!, testName: String!): Test
  pullRequest: PullRequest
}`;

class Build {
  constructor(build) {
    this.jobName = build.jobName;
    this.buildId = build.buildId;
    this.startTime = build.startTime;
    this.url = build.url;
    this.result = build.result;
    this.building = build.building;
    this.description = build.description;
    this. duration = build.duration;
    this.gitProject = build.gitProject;
    this.gitRepository = build.gitRepository;
    this.pullRequestId = build.pullRequestId;
  }

  async aggregate() {
    let agg = (await pg.aggregateTests('reports', [
      {field: 'jobName', op: '=', value: this.jobName},
      {field: 'buildId', op: '=', value: this.buildId}
    ]))[0];
    this.total = agg.total;
    this.pass = agg.pass;
    this.fail = agg.fail;
    this.unstable = agg.unstable;
    this.pass_percent = utils.calcPercent(this.pass, this.total);
    this.fail_percent = utils.calcPercent(this.fail, this.total);
    this.unstable_percent = utils.calcPercent(this.unstable, this.total);
    return this;
  }

  async tests() {
    let ret = [];
    let tests = await pg.select('reports', [{field: 'jobName', op: '=', value: this.jobName}, {field: 'buildId', op: '=', value: this.buildId}]);
    tests.forEach(t => ret.push(new Test(t)));
    return ret;
  }

  async test({className, testName}) {
    let tests = await pg.select('reports', [
      {field: 'jobName', op: '=', value: this.jobName},
      {field: 'buildId', op: '=', value: this.buildId},
      {field: 'testClassName', op: '=', value: className},
      {field: 'testName', op: '=', value: testName}
      ]);
    return new Test(tests[0]);
  }

  async pullRequest() {
    let res = {};
    if (this.gitProject===undefined || this.gitRepository===undefined || this.pullRequestId===undefined ) {
      try{
        res = (await utils.queryJenkinsSetting(this.url));
      } catch (e) {
        throw new GraphQLError(e);
      }
      let parameters = res.actions
        .find(i => i._class==='org.jenkinsci.plugins.ghprb.GhprbParametersAction').parameters;
      this.gitProject = parameters.find(i => i.name === 'GIT_PROJECT').value;
      this.gitRepository = parameters.find(i => i.name === 'GIT_REPOSITORY').value;
      this.pullRequestId = parameters.find(i => i.name === 'ghprbPullId').value;
    }
    pg.upsertBuild(this);
    let gql = `Repository($owner: String!, $name: String!, $number: Int!){
      repository(owner: $owner, name: $name){
        pullRequest(number: $number){
            number            
            title            
            state          
        }
      }
    }`;
    let data = JSON.parse(
      await github.query(gql, {owner: this.gitProject, name: this.gitRepository, number: this.pullRequestId})
    ).data;
    if (data === null) {
      throw new GraphQLError("Cant find pull request: Project[{0}], Repository[{1}], Pull request[{2}]"
        .format(this.gitProject, this.gitRepository, this.pullRequestId));
    }
    return new PullRequest(data.repository.pullRequest);
  }
}

let getBuilds = function (jobName, buildId) {
  return new Promise((resolve, reject) => {
    pg.getBuilds(jobName, buildId)
      .catch(e => reject(e))
      .then(res => resolve(res))
  });
};

module.exports = { Build, schema_Build, getBuilds };
