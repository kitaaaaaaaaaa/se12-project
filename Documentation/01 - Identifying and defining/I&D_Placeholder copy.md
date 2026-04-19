# Starting Point: (PLACEHOLDER)

1. Define the problem it is being created to solve.

2. What is the software you have decided to create?

3. Define its scope/boundaries - what it will and will not do.

4. Who is it for? How would it be used? What are the important characteristics and/or features?

5. What constraints may affect the project?

6. What assumptions are being made about the scenario and/or users?

---
# Chosen Scenario
This page provides information about the scenario chosen for this project.

## Context
A small backstage/audio crew at my school struggles to organise the necessary gear and equipment for each performance during a school concert, which takes place in a dark environment. On average there are 18-20 distinct performances with varying tech configurations and equipment layouts needed. Members are split into several responsibilities to seamlessly run the event: backstage hands, curtains, visuals, sound, camera, lighting. Some tasks include lighting changes, microphone handoffs and visual transitions.

Crew members currently follow along using paper run sheets, which are hard to read in the dark and become quickly outdated. The run sheets also have an overwhelming amount of information and it is harder to juggle multiple responsibilities in a time sensitive environment, especially with limited communication between crew.

These responsibilities are exacerbated by the fact that crew members have to accomodate for students who do not know stage ettique, correct microphone handling and effective on-stage positioning.

There is reliable Internet access throughout the concert venue, but the software must account for any connection errors.

## User roles
Since the audio crew has senior members, the software will support two types of users:

| Administrator | Crew Member |
| - | - |
| This could include teachers, stage members or leaders within the crew. They are responsible for planning and managing the event, as well as overseeing the event. They will be allowed to create, edit and delete run sheets, progress the run sheet forward/backward during pre-show rehearsals or the concert itself. | Crew members carry out the tasks assigned to them, as displayed by the software solution. They also need to be able to prepare for upcoming tasks and performances |



## Current situation
Run sheets are currently created in Google Sheets, then printed off hours before the show. It contains information on: the performance name, the performers, the type of performance, its estimated run time, people on stage and technical requirements. It provides rather vague instructions to crew memebers and they must follow along themselves in the dark, which can be difficult with the limited amount of time and lack of communication. There is no viable means of communication.

Also, details are often changed last minute to accomodate for absent people or equipment failures. This is currently mitigated by displaying the program on Google Sheets, using laptops/desktops placed in key areas. This does not solve the issue that the run sheet contains mostly irrelevant information - a lot of time is spent reading and re-reading the run sheet to ensure the event runs smoothly. By making it simpler to read, members can focus on performing their tasks, reducing hiccups and forgotten equipment.

## Desired outcome
Ideally, the following improvements should occur:
- Crew members are less confused as to what their responsibilities are, reducing incorrect and forgotten technical steps
- Less time is spent deciphering run sheets, allowing members to focus their efforts into troubleshooting unpredictable issues
- Run sheets are easier to read in the dark, reducing cognitive load

## Scope and scale
- The software will be used by 8-12 crew members concurrently. 
- The most often that the software will be used is around every month. 
- The software will only be used in Australia. 
- It will be used during concerts and events.

---

# Digital AV Crew Run Sheet
A small backstage and audio crew at a school struggles to organise the necessary gear and equipment for each performance during a school concert. Paper run sheets and stage plans are hard to read in the dark and become outdated when it needs to change. The run sheets have too much information, forcing crew memebers to waste precious time and effort in filtering, processing and taking in  information.

Members are split into roles, sometimes taking on multiple: backstage, curtains, visuals, sound, camera and lighting. The run sheet has instructions for all teams, making it harder for specific roles specific roles to follow their cues.

Many members are also new, requiring explicit instruction, which is only possible from a senior student. This reduces the effectiveness of the backstage crew since there are not enough seniors to direct everyone.

**Scope and Scale:**
The software will be used by about 8-12 crew members, as well as 2-3 teachers who are involved with the organisation of the concert. The software may also be used for other school events, which may involve anywhere from 4 to 20 crew members with various roles. The software will not support concurrent, live, synchronised editing of a run sheet. It will only display the run sheet in a user-friendly manner, reducing decision fatigue.

The most often that the software will be used is every month.

The software will only be used in Australia. It will be used during concerts and events, which may be dark to avoid distracting the audience.

**Software Functionality and Features:**
<table>
    <tr>
        <th>Essential Features</th>
        <th>Optional Features</th>
    </tr>
    <tr>
        <td>
            <ul>
                <li>A homepage to view all events</li>
                <li>Ability to edit event run sheets</li>
                <li>Function to 'play' the run sheet during the event and progress it forward</li>
                <li>Function for members to view the live/digital run sheet according to their specific role</li>
                <li>Authentication system to distinguish an administrator and a crew member</li>
            </ul>
        </td>
        <td>
            <ol>
                <li>Ability for admin to jump to a specific step for rehearsals</li>
                <li>Toggle between light and dark mode</li>
                <li>Support for mobile devices</li>
                <li>Quickly accessible glossary of key terms (e.g. L, C, R, FL, FC, FR etc.) with diagrams</li>
            </ol>
        </td>
    </tr>
</table>

<u>Inputs:</u> 
Information for each step in the run sheet, user credentials and user roles/responsibilities
<br>
<u>Outputs:</u> 
Filtered run sheets with each step, including performance title, action, role and notes
<br>
<u>User Interface:</u>
Users must be able to interact with the software on a desktop or laptop, which would be placed in a highly visible area for crew members to view. The user interface should be minimal and not cluttered.
<br>
<u>Types of data required:</u>
String, boolean, integer
<br>
<u>Technical requirements:</u>
App must be able to cache run sheets to enable offline functionality, app must be compatible with desktops and laptops, but mobile devices are not as important

**Constraints:**
Limited budget and time for software development and maintenence. Must be completed in roughly 12 weeks.

**Assumptions:**
Every user will have access to the Internet and users are proficient in navigating technology.
