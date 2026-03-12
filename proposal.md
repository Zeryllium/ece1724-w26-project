# Project Proposal

**Project Name:** MyLearn, a full-stack personalized learning platform

**Collaborators:** David Zhang, Tyler Sun, Rohan Datta

## Table of Contents

* [Motivation](#motivation)
    * [Background](#background)
    * [Problem Statement](#problem-statement)
* [Objective and Key Features](#objective-and-key-features)
    * [Objective](#objective)
    * [Key Features](#key-features)
    * [Advanced Features](#advanced-features)
    * [Project Scope and Feasibility](#project-scope-and-feasibility)
* [Tentative Plan](#tentative-plan)
    * [Week-By-Week Plan](#week-by-week-plan)
    * [David](#david)  
    * [Rohan](#rohan) 
    * [Tyler](#tyler)
* [Initial Independent Reasoning](#initial-independent-reasoning)
    * [Application Structure and Architecture](#application-structure-and-architecture)
    * [Data and State Design](#data-and-state-design)
    * [Feature Selection and Scope Decisions](#feature-selection-and-scope-decisions)
    * [Anticipated Challenges](#anticipated-challenges)
    * [Early Collaboration Plan](#early-collaboration-plan)    
* [AI Assistance Disclosure](#ai-assistance-disclosure)
    * [Parts of the Proposal That Were Developed Without AI Assistance](#parts-of-the-proposal-developed-without-ai-assistance)
    * [What Specific Tasks or Drafts Did AI Help With?](#specific-tasks-that-ai-helped-with)
    * [One Idea Where AI input Influenced Our Proposal](#one-idea-where-ai-input-influenced-our-proposal)

## Motivation

### Background
The significance of high quality online learning has increased over recent years, but online learning has unique challenges which can limit its effectiveness compared to in person tutoring. Students may find it difficult to adapt to an online environment and communication can often be slower without direct face-to-face interactions between the student and teacher. As such, accessible educational platforms are needed for both students and educators for effective teaching and learning. 

### Problem Statement
The following project will develop an intuitive and efficient system that both students and teachers can use to manage their courses and any respective learning materials. Teachers will be able to track their course, create assessments, and track progress of students to check on overall class progression while students will be able to navigate courses and access resources easily, making it applicable and useful for any educational context.

The project is worth pursuing to push higher quality online education to a larger range of individuals, strengthening students for overall future societal gain. The application would largely be marketed towards educational institutions, as it provides them with a centralized method for all students to manage any number of courses regardless of their field of study or number of courses. The website will also be suitable for tutors for specific subjects, as they can use the platform to manage resources and ease communication with themselves and their students.

## Objective and Key Features

### Objective
This project aims to provide a personalizable learning platform where instructors can create courses, with the corresponding learning material and assessments, that students can enlist in and progress through.

### Key Features
This would be developed using full-stack Next.js, ideally deployed on a DigitalOcean Droplet. Users would be required to register for an account in order to access the web application. This account data, along with the roles, course metadata, and forum posts associated with it, would be kept in a Postgres database. Course content would be stored in object storage instead (e.g. DigitalOcean Spaces). The web application would be mainly split into three routes handled using Next.js; these are the login page, the account details and enlisted/enrolled courses page, and the course page. This fulfills all basic course project requirements.

<figure>
  <img src="https://github.com/Zeryllium/ece1724-w26-project/blob/main/Postgres%20Schemas%20Draft%2002.png" alt="Image of the second draft Postgres database schema">
  <figcaption>Figure 1: Preliminary draft of the Postgres Schema</figcaption>
</figure>

### Advanced Features
User authentication and authorization are integral to this application to differentiate between students and instructors. For example, only instructors would be able to edit course and module content through protected endpoints. This would be handled using the Better Auth framework.

This project will also incorporate several real-time features including real-time notifications for students when new modules are published, course progress meters for each student, and enrollment/completion gauges for each course. This will primarily be done through Server-Set Events (SSE) and a live connection to Postgres listening for LISTEN/NOTIFY events. On update of the corresponding tables, Postgres would emit an event to this endpoint and Next.js would forward the appropriate information to connected clients.

Finally, this project will aim to incorporate third party integrations such as utilizing the Google Calendar API to remind students of pending assessments or using a PDF generator to create personalised certificates.

### Project Scope and Feasibility
While it would be incredibly useful to have a platform that can universally handle all freeform assessments, course content, forum pages, and instant messaging, we determined that this is infeasible to do in the three weeks timeline for this project. As such, we have limited the scope of the module content to just videos and images hosted in object storage and freeform text. Additionally, our initial plan is to only use forms for assessments (i.e. in the style of an online quiz) and later expanding this to include file submissions if time permitting. Finally, we determined that while instant messaging may be a helpful feature for students, comments on pages serve very similar purposes while also remaining within our chosen tech stack. 

## Tentative Plan

### Week-By-Week Plan
#### Week 1: Core Infrastructure & Authentication
Initializing the Next.js project with TypeScript, Tailwind CSS, and shadcn/ui will be done as well as setting up the PostgreSQL schema and connecting it via Prisma ORM. Implementing Better Auth for role-based access should also be done this week as well to ensure there is a clear distinction of the collection of pages each type of user has access to. The goal would be to have a working login system and basic functionality of the courses route.

#### Week 2: Course Management & File Handling
The plan for this week is to build out the core functionalities for the Instructor user workflow. This is where Instructors can manage course content (e.g. full text lessons or videos). Additionally, the Students' UX experience should be worked on in parallel to reflect the additional features in the Instructors' workflow. The goal is to have functioning CRUD for the courses and file persistence of the course materials.

#### Week 3: Advanced Features, Testing and Validation
This week will be mainly focused on adding remaining module types such as quizzes and assessments. Additionally, advanced features such as live notifications and third party integrations will also be developed.

#### Breakdown of Responsibilities
To ensure completion of the project in an optimal manner, the tasks will be divided to match each team member’s skill sets.

### David
- Responsible for the PostgreSQL schema design and implementation with Prisma ORM
- Responsible for setting up Better Auth framework implementation
- Cloud deployment for both storing the educational content and hosting the platform

### Rohan
- Creating the SSE implementation with Postgres triggers for real-time advanced feature
- Creating Learning Record System API and implementing it within the code
- Integrating Google Calendar API
- Handling PDF generation microservice

### Tyler
- Focused on React component architecture
- Handling state management for real-time updates
- Ensuring responsive dashboard design

Aside from tasks listed above, all members will work on creating the back-end and front-end code for each of the key features. This includes writing API endpoints, tests, React layouts, API call functions, and making CSS design decisions.

## Initial Independent Reasoning

### Application Structure and Architecture
Next.js allows for rapid prototyping without worrying too much about the specifics with backend routing. Additionally, we expect this web application to have about the same number of users as a typical college or university. As such, we determined that, based on the userload,  it was not worth the complexity tradeoff for independently scalable backend and frontend services. Finally, we do not have any critical real-time, low-latency functions that would necessitate a dedicated backend service, and thus it makes sense to use the rapid development strategy of a Next.js full-stack.

### Data and State Design
See Figure 1 for the draft of the database schema. Intuitively, it makes sense to store users and courses in different tables. Additionally, it is also intuitive to break down courses into modules, with each module containing a lesson plan, content, and potentially an assessment. While most of these are easily stored in a relational database, lesson content generally is more free-form. As such, rather than storing this in a relational database (and by extension, block storage), we decided to store the URI of this resource in the database and the actual content in an object storage (e.g. DigitalOcean Spaces).

### Feature Selection and Scope Decisions
Keeping in mind the three-week plan for this project, we decided to go for a rapid prototyping approach at the cost of long-term scalability and user throughput. As such, Next.js fullstack was the most appropriate choice. However, even still, Postgres was preferred over SQLite as this application is intended for 100-1000 people rather than a single user. As previously mentioned, authorization and authentication is required due to the different workflows of Instructors and Students. Finally, while true real-time features (<50ms) require a dedicated backend service, we can still maintain fast prototyping with Next.js while having uni-directional real-time (server → client) with SSE and third-party API calls.  

### Anticipated Challenges
We believe that one of the major challenges would be understanding exactly how the relational data should be structured to ensure minimal performance costs when querying the Postgres database. While we believe our current schema draft is sufficient in encapsulating the general flow of data throughout the application, it is possible that we have missed planning out a data structure that would be integral to an advanced feature. Additionally, until we have a prototype of the web application, it is difficult to predict where relationships or queries could be optimised (e.g. in the event of an N+1 query).

Likewise, caching and data fetching on the Next.js side of things is also an expected challenge. This will likely be a tradeoff between complexity, performance, and security as we will need to manage user sessions (and security) with application state while ensuring we do not overwhelm our Postgres database.

Finally, many third party integrations expect long-lasting live connections between the client and server. As such, these generally involve using a dedicated backend service with WebSockets to create and manage these connections. It is uncertain how this could be translated to Next.js fullstack if at all possible.

### Early Collaboration Plan
It is expected that each team member focuses on one part of the stack. This allows for concurrent development without needing highly synchronous work sessions such as pair programming. Ideally, each team member focuses on a part of the stack that they are most familiar or most confident with. GitHub and Instant Messaging would be used for coordinating code contributions and reviewing the work of other team members. 

## AI Assistance Disclosure
We found AI to be useful with helping to create parts of our proposal, especially when we had trouble finding resources online with normal Google searches as the stored information from AI LLMS provided invaluable insight.

### Parts of the Proposal Developed Without AI Assistance
The initial project concept for the Personalized Learning Platform was developed without any AI, along with the Motivation section, the preliminary database schema design, initial reasoning, and the breakdown of individual responsibilities.

### Specific Tasks That AI Helped With
AI was used to help refine the Tentative Plan by transforming our high-level goals into a structured 3-week sprint. It also assisted in providing ideas for technical libraries and third-party APIs that we could incorporate for our advanced features implementations.

### One Idea Where AI input Influenced Our Proposal
One case was where AI suggested a development schedule that suggested working through the Real-Time and External API advanced feature setup and implementation in the first two weeks to ensure there would be enough time for debugging.
	
While this suggestion made by AI was ideal with regards to handling the advanced features, our team needed to adjust it based on our personal academic commitments to other courses. We provided AI with context regarding some of our other important deadlines happening in the month of March to get a better schedule planning. This sparked a discussion between us about the tradeoff of either having technical momentum and burnout by the end of the project or finishing the project ahead of time and leaving off more time to spend preparing for the presentation.

Ultimately, we decided to push the complex integration tasks into Week 3 which will allow us to focus on the MVP during the weeks we have more time. This ensures that the nice-to-have features are addressed after the major deliverables are finished.
