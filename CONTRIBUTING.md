# Contributing Guide

How to set up, code, test, review, and release.

## Code of Conduct
IMPORT THIS FROM THE TEAM CHARTER - Currently a WIP

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
When developing lambda functions for the backend, the functions wil be automatically deployed to AWS using this proceedure: https://docs.aws.amazon.com/lambda/latest/dg/deploying-github-actions.html

## Security & Secrets
It is prohibited to write secrets(ie. API tokens, client secrets, etc) to this repo anywhere, this includes any branch, or commit. If such a item has been accidently written to the repo. Report it to the team immediately, and take the steps necessary to refresh the secret such that the previous value is null and does nothing.

## Documentation Expectations
If any big change has been made that changes how to set up your local enviornment, update the TEADME file accordingly

## Release Process

Describe versioning scheme, tagging, changelog generation, packaging/publishing steps, and rollback process.

