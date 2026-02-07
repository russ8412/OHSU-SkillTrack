## Frontend Release Notes


| 1.1 |
|--------|
| Initial Frontend release into main branch. Student-facing views were styled to align more closely with the Figma design. Navigation was refactored using the (tabs) layout for seamless page transitions using a navigation bar. General, reusable styles were introduced via styles.ts. Added AppText as the standard font for our application to be used across all pages to ensure consistency. Integrated the skills/[id].tsx page with the GetCourseInformation API to enable data retrieval from the database. For the instructor view, a page was added that can call the /FetchUserData endpoint to check off a student.|

| 1.0 |
|--------|
| Each merge into main should increment the second number of the version, ie. the version after this should be 1.1, the one after that 1.2, after 1.9 the order is 1.9, 1.10, 1.11, 1.12, etc. If there is a MAJOR release, to be determined by the team, then the initial digit can be incremented. Each merge should also detail what features are being added, in this box. |
