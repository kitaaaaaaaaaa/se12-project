# Project Journal
This will summmarise what you have done in relation to the project, and in particular the problems you encountered and how you dealt with them.

With each entry, also include:
- [ ] Date
- [ ] Any communications you had with others concerning the project
- [ ] Any other thoughts or ideas that you had concerning the project
- [ ] Screenshots

**1. Aims**

- Goals for the week. Specific tasks, features or research topics.

Example: 
*“This week I aim to complete user authentication and set up the database schema.”*

- Add justification for why these tasks matter. Include a link to your project requirements or next steps if possible.

Example: 
*“Authentication is essential before I can personalise the dashboard.”*

**2. Progress**

Describe what you actually did, focusing on thinking, not just doing:
- Key tasks completed
- Code or design decisions made
- New concepts learned. (Include Evidence i.e. screenshots or snippets)

**3. Challenges and Solutions**

Describe problems, bugs, or blockers you faced. Explain how you diagnosed the issue (debugging, console logs, reading errors)

List resources used to help solve the problem:
- Online Resources (GitHub, StackOverflow, YouTube etc..)
- Course Notes
- ChatGPT Assistance 
- Collaboration with Peers or Teacher Assistance
Summarise the final solution and why you chose it.

**4. Reflection**
- What went well this week?
- What didn’t go well?
- What would you do differently next time?
- What skills or knowledge improved?

Example:
*“I underestimated how long building authentication would take. Next week I will break tasks into smaller items and estimate time more realistically.”*

 **5. Aims for Next Week** 

Briefly end each entry by listing:
- Priorities for the next stage of development
- Parts that need more follow-up

Example:
*“Next week I will be focussing on the Quality Assurance Document and adding lazy loading to my project.”*

## 22/3/2026
**Aims:**
I aim to get a start on the SEP by setting the foundation for documentation structure. This will save time in the long run, so I don't have to worry about documentation formatting.

**Progress:**
Downloaded and read the project notification, and created the structure of the ePortfolio. Also set up the neccessary software (GitHub Desktop) and links between GitLab and VSCode. I also started the project journal.

**Challenges and solutions:**
There were no challenges faced with creating the structure of the ePortfolio.

**Reflection:**
I aimed to set up the structure of the documentation so that I do not have to worry about it later on in the project.

**Aims for next week:**
Starting on the project itself by generating potential ideas and scenarios.

## 8/4/2026
**Aims:** Brainstorm some ideas and scenarios using a mindmap, and with the help of Gemini to create a wide range of ideas.

**Progress:**
Created a set of GitLab commit conventions to adhere to, ensuring consistency and allowing the commit history to be more accessible. Every commit from now on will follow the [conventional commits specification](https://www.conventionalcommits.org/en/v1.0.0/).
![](Assets/git_commit_conventions.png)

Added files from the project template into my own documentation to give myself starting points for when I commence future phases of the project.

Made a mindmap to brainstorm potential ideas and technical requirements:
![](Assets/ideas_mindmap.png)

I also created my detailed scenario this week, taking inspiration from my own experience helping out backstage during a concert. I wanted to ground the project in something I knew well, which makes it easier to create software requirements.

**Challenges and solutions:**
Was signed into multiple accounts on VSCode, which lead to wrongly authored commits. This was fixed by removing unneccesary accounts and modifying commit history to indicate the correct author.

Using [this article](https://www.git-tower.com/learn/git/faq/change-author-name-email) and the Gemini summary provided at the top of Google search pages, I used interactive rebasing to edit the author of the previous commits.

**Reflection:**
I successfully familiarsed myself with markdown this week, but I didn't think that brainstorming ideas would take so long. Next week, I have to keep my writing concise.

**Aims for next week:**
Develop a project proposal and hopefully start the research & planning phase.

## 15/4/2026
**Aims:**
This week, I aim to finish the Identifying and Defining phase and start work on the Research and Planning phase.

**Progress:**
This week I worked through my project proposal and the I&D phase. I currently have worries about how feasible this project is, especially with the given time frame. There is some room in the scenario to further reduce the amount of essential features (e.g. No synchronised run sheet). I also explored [GitHub flavoured markdown](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-collapsed-sections) to find new ways to format project documentation, like the collapsable text below.

<details>
<summary>Draft explanations of chosen software development approach</summary>

I also listed all the entities that will be represented in the software (thus starting the R&P phase):
- Events as an object from an event class
- Users as an array of records or a database
- Run sheet steps as an array of objects
    - Each step would be an object with: step number (integer), step instruction (string), performance title (string), assigned role (string), notes (string)
</details>

**Challenges and solutions:**
The project notification and the course work have varying instructions. I had to consolidate them such that all dot points were being discussed. I may have to reorganise my I&D phase later on, but I know that all of the required information is in there.

**Reflection:**
I believe I still need to cut down the amount I write for future phases, but I will have to check with my teachers. I have fleshed out my scenario, which will serve as the foundation for the rest of the project. I am glad that I grounded the scenario in something I know and have experience in - 3 years of live sound/backstage inspired this project. 

Writing rough plans for what I am going to write in my documentation also significantly helps and reduces the effort required to sit down and write documentation.

**Aims for next week:**
Start work on the researching and planning phase.

## 20/04/2026
**Aims:**
- Meet with teachers to clarify project
- Continue R&D and get as much done as possible before other assessments start. This would also give more time for producing & implementing.
    - Write documentation for determining software development approach. This has to be done so I can determine how my GANTT chart should be structured.

**Progress:**
- Restructured and organised I&D documentation to make it easier for third parties to read. Those unfamiliar with live sound/production would struggle to grasp the context for the project.
- Client suggested to display the time before a certain step. From my experience making the Learner Hours PWA, date and time calculations can get messy if done without using in-built features (such as JavaScript's `Date()` object). This is why I added this as an optional feature to add last.
- Assessed the scheduling feasibility of the project, with help from teachers. Created some backup options as a result:
    - Crew members could press 'next' on their own, rather than having it synchronised
    - Remove ability to edit run sheets *during* an event
- Considered some possible limitations:
    - Lack of technical skill required to build back-end
    - Time management will be of utmost importance, especially with other assessments and projects. GANTT chart timings are adjusted accordingly, keeping this limitations in mind.
- GANTT chart was made. 
    - The timeline may seem unrealistic at first glance, but I tried to take into account the previous phases of the project, and how it would speed up development. For example, event administrator home page would take less than a week since I would have made UI components. 
    - Some events are also quite long, since I try to take my exam dates into account. I also tried to condense development a bit, since I am involved in backstage productions for a musical on 14th June. I am hoping I can trial run the software there. 
    - There is ongoing client feedback, following a characteristic of Agile. 
    - The chart is the absolute ideal, and I have one week to spare to account for unforeseen problems.
- Created comparison table to effectively choose an appropriate software development approach using this [Portable.com.au article](https://portable.com.au/articles/waterfall-agile-wagile-project-methodology-decision) and [Atlassian article](https://www.atlassian.com/agile/project-management/project-management-intro)

![](Assets/approach_comparison.png)

**Challenges and solutions:**
- Client had trouble grasping the concept of the project, even after some discussion. Created a rough design of the UI to visualise the software solution and make it easier to understand, as seen in the [executive summary](./01%20-%20Identifying%20and%20defining/1.%20Executive%20Summary.md#software-functionality)


**Reflection:**

**Aims for next week:**

---
## DD/MM/YYY
**Aims:**
**Progress:**
**Challenges and solutions:**
**Reflection:**
**Aims for next week:**