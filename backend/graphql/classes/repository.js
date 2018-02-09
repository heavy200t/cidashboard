let github = require('../../database/gitHub');
let {PullRequest} = require('./pullRequest');
let schema_Repository = `
  enum PullRequestState {
    OPEN
    CLOSED
    MERGED
  }
  type Repository {
    owner: String!
    name: String!
    pullRequest(number: Int!): PullRequest
    pullRequests(first: Int, after: String, last: Int, before: String, states: [PullRequestState!]): [PullRequest]
  }
`;

class Repository {
  constructor(owner, name) {
    this.owner = owner.trim();
    this.name = name.trim();
  }

  async pullRequest({number}) {
    let gql = `Repository($owner: String!, $name: String!, $number: Int!){
      repository(owner: $owner, name: $name){
        pullRequest(number: $number){
            number
            title            
            state          
        }
      }
    }`;
    let data = JSON.parse(await github.query(gql, {owner: this.owner, name: this.name, number: number})).data;
    return new PullRequest(data.repository.pullRequest);
  }

  async pullRequests({first, after, last, before, states}) {
    let gql = `Repository($owner: String!, $name: String!){
      repository(owner: $owner, name: $name){
        pullRequests(first: $first, after: $after, last: $last, before: $before, states: $states){
          nodes{
            number
            title
            body
            state
          }
        }
      }
    }`;
    let res = (await github.query(gql, {owner: this.owner, name: this.name, first: first, after: after, last: last,
      before: before, states: states}));
    return new PullRequest();
  }
}

module.exports = {Repository, schema_Repository};
