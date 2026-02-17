# Contributing Guide

Review this document to learn our guidelines on how to set up, code, test, review, and release.

## Code of Conduct
1. Provide constructive feedback when reviewing other people's code. Be specific as to what changes you would like to be seen made. And if you do see an issue, do not hesistate to point it out, better safe than sorry.
2. Be responsive if other people have questions about your code, a rule of thumb is to reply within 24 hours.
3. Follow merging guidelines, do not merge code unless the appropriate review has been made on it.

## Getting Started
Please review the README.md file for how to prepare your environment to run the app. 

## Branching & Workflow
The default branch is **main**, this branch should **never** be written to directly. 

When making contributions, always create a **new branch** or contribute to an **existing feature branch** instead.

If multiple contributors are working together on a set of related or complex features (for example, when the front-end team is implementing several features that are best released together), they should use a **release branch** workflow.
All contributors to that bundle should merge their changes into a release branch. Once the release branch is complete, stable, and ready, a pull request (PR) should be opened to merge it into main.

## Issues & Planning
Our Trello board is the primary way used to plan for the future, please make sure to make a card as you plan what features you will work on, and move the card along as you close features.

## Commit Messages
Commit messages should explain what the commit is accomplishing.

## Code Style, Linting & Formatting
Variable names should be consistant. All important code files should have header section explaining what the code file does. In-line comments should be used as needed to explain parts of code that are harder to understand

## Testing
Generally, when new features are implemented, the writter of the PR is responsible for defining how test their feature. Most testing will be manual.

Backend testing will generally consist of testing API endpoint with a service like Postman and see if the output is as expected

## Pull Requests & Reviews
Each feature PR must go through a review process before being merged.
The required number of reviews is slightly different for backend a frontend PRs:
- Front-End: Reqiures **at least 1** approving review to merge.
- Back-End:  Reqiures **at least 2** approving reviews to merge.
- Misc: Reqiures **at least 2** approving reviews to merge.

After the threshold for approving reviews is reached, **the PR author is responsible for merging the code** as they know best if the code is truly ready to merge

Reviewers are expected to look through all modified files, and comment any potential problems that they see in the code. They are also expected to enforce good coding practices.

## CI/CD
When developing lambda functions for the backend, our code will follow a Infrastructure as Code (IaC) methodology, using the AWS Serverless Application Model (AWS SAM) to write code into our repo, and then deploy onto our live AWS system.
For a detailed explanation on how to develop code with the SAM, this document is useful: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html
The needed infra is already there to actually build and deploy code though, in which case, the main important functions are these two: 
https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-build.html
https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html

The most important detail to know is that the resources we want to deploy are to be specified in the template.yaml file (database tables, endpoints, user pools, etc.) And then to define specific functions for endpoints, we make a python file in a new folder to define that behavior.

## Security & Secrets
It is prohibited to write secrets(ie. API tokens, client secrets, etc) to this repo anywhere, this includes any branch, or commit. If such a item has been accidently written to the repo. Report it to the team immediately, and take the steps necessary to refresh the secret such that the previous value is null and does nothing.

## Documentation Expectations
If any big change has been made that changes how to set up your local enviornment, update the README file accordingly

## Release Process
Release Notes and versioning are seperated into the Front-end and the Back-end, these will have seperate versions. Each has a file called ReleaseNotes.md. Each time a merge is made into the main branch counts as a release and requires a new version entry in the ReleaseNotes file, but only for the affected component (ie. a backend feature update only requires a entry on the backend release notes.). Each merge into main should increment the second number of the version, ie. the version after 1.0 should be 1.1, the one after that 1.2. After 1.9 the order is 1.9, 1.10, 1.11, 1.12, etc. If there is a MAJOR release, to be determined by the team, then the initial digit can be incremented. Each merge should also detail what features are being added, in this box.


