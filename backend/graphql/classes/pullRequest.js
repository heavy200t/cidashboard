let schema_PullRequest = `
  type PullRequest {
    number: Int!
    title: String!
    state: PullRequestState    
  }
`;

class PullRequest {
  constructor(pr) {
    this.number = pr.number;
    this.title = pr.title;
    this.state = pr.state;
  }
}

module.exports = { PullRequest, schema_PullRequest };
