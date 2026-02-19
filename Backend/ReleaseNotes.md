## Backend Release Notes

| 1.2|
|--------|
| 2/19/2025 - The first big batch of essential endpoints has been created, these are: /FetchUserData, /GetListOfTemplates, /CreateCourseFromTemplate, /AddStudentToCourse, /GetCourseInformation, /CheckStudentOff. This set of endpoints should be sufficient to run the app provided that user accounts are configured, and course templates already in place. Future endpoints will
focus on closing that remaining gap.|



| 1.1|
|--------|
| 11/23/2025 - Basic AWS backend structure has been created. This update primarly consists of resources provisioned in the template.yaml file, which tells AWS what resources to deploy, this includes the basic Lambda+Gateway pattern, currently there is one lambda function, and it's endpoint is created w/aws gateway. This lambda function is a simple hello world. But it has code that fetches data from the DB at the moment (although it is currently not working due to some recent changes in the db table structure). The template file also provisions our skilltrack dynamo db table, and it provisions cognito user pools, and it also protects the backend endpoints with authentication based on those cognito user pools |


| 1.0 |
|--------|
| Each merge into main should increment the second number of the version, ie. the version after this should be 1.1, the one after that 1.2, after 1.9 the order is 1.9, 1.10, 1.11, 1.12, etc. If there is a MAJOR release, to be determined by the team, then the initial digit can be incremented. Each merge should also detail what features are being added, in this box. |
