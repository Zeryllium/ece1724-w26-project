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
The significance of high quality online learning has increased over recent years, but online learning has challenges which can limit its effectiveness compared to in person tutoring. Students may find it difficult to adapt to an online environment and communication can often be slower without direct face-to-face interactions between the student and teacher. As such, accessible educational platforms are needed for both students and educators for effective teaching and learning. 

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
Initializing the Next.js project with TypeScript, Tailwind CSS, and shadcn/ui will be done as well as setting up the PostgreSQL schema and connecting it via Prisma ORM. Implementing Better Auth for role-based access should also be done this week as well to ensure there is a clear distinction of the collection of pages each type of user has access to (Teacher and Student). The way we measure this week’s success will be having a working login system and basic dashboard layout.

#### Week 2: Course Management & File Handling
This week focuses on building some of the core functionalities for the Teacher user which is the “Course Creation” workflow. This is where Teachers can upload their text content and PDF uploads and maybe video content. Also building the Student actor’s “Course View” and enrollment logic is a goal for this week as we will be able to see noticeable change on the Student’s dashboard after Teachers make their course(s). Intuitively since we are working with getting the Teacher’s content to be uploadable, we will need to set up a cloud storage for keeping that educational material. The metric for success this week is if we can have a functioning CRUD for the courses and file persistence of the course materials.

#### Week 3: Advanced Features, Testing and Validation
As we are wrapping up on the key features of this project like the content builder for quizzes and assignments as well as the assignment submission page, we’ll be working on the advanced features. This week we’ll be implementing the Postgres LISTEN/NOTIFY triggers and Server-Set Events endpoints to get live notifications working. We’ll also be working on getting a Learning Record System (LRS) setup with a third-party and learning their API to integrate with our platform and send student activity logs through. How we’ll measure success this week’s end is by seeing if we have live notifications and the external APIs working as well as all of the other functionality of our platform operating as intended.

#### Breakdown of Responsibilities
To ensure we complete this project in an optimal manner, we are dividing the tasks to match each team member’s skill sets.

### David
- Responsible for the PostgreSQL schema design and implementation with Prisma ORM
- Creating the SSE implementation with Postgres triggers for real-time advanced feature
- Cloud deployment for both storing the educational content and hosting the platform

### Rohan
- Responsible for setting up Better Auth framework implementation
- Creating Learning Record System API and implementing it within the code
- Integrating Google Calendar API
- Handling PDF generation microservice

### Tyler
- Focused on React component architecture
- Handling state management for real-time updates
- Ensuring responsive dashboard design

Aside from these listed above, we all will be working on creating the back-end and front-end code for each of the key features. This includes writing API endpoints, tests, React layouts, API call functions, and making CSS design decisions.

## Initial Independent Reasoning

### Application Structure and Architecture
Next.js allows for rapid prototyping without worrying too much about the specifics with backend routing. Additionally, we expect this web application to have about the same number of users as a typical college or university. As such, we determined that, based on the userload,  it was not worth the complexity tradeoff for independently scalable backend and frontend services. Finally, we do not have any critical real-time, low-latency functions that would necessitate a dedicated backend service, and thus it makes sense to use the rapid development strategy of a Next.js full-stack.

### Data and State Design
See Figure 1 for the draft of the database schema. Intuitively, it makes sense to store users and courses in different tables. Additionally, it is also intuitive to break down courses into modules, with each module containing a lesson plan, content, and potentially an assessment. While most of these are easily stored in a relational database, lesson content generally is more free-form. As such, rather than storing this in a relational database (and by extension, block storage), we decided to store the URI of this resource in the database and the actual content in an object storage (e.g. DigitalOcean Spaces).

### Feature Selection and Scope Decisions

### Anticipated Challenges
We believe that one of the major challenges would be understanding exactly how the relational data should be structured to ensure minimal performance costs when querying the Postgres database. While we believe our current schema draft is sufficient in encapsulating the general flow of data throughout the application, it is possible that we have missed planning out a data structure that would be integral to an advanced feature. Additionally, until we have a prototype of the web application, it is difficult to predict where relationships or queries could be optimised (e.g. in the event of an N+1 query).

Likewise, caching and data fetching on the Next.js side of things is also an expected challenge. This will likely be a tradeoff between complexity, performance, and security as we will need to manage user sessions (and security) with application state while ensuring we do not overwhelm our Postgres database.

Finally, many third party integrations expect long-lasting live connections between the client and server. As such, these generally involve using a dedicated backend service with WebSockets to create and manage these connections. It is uncertain how this could be translated to Next.js fullstack if at all possible.

### Early Collaboration Plan

## AI Assistance Disclosure
We found AI to be incredibly useful with helping us create parts of our proposal, especially when we had trouble finding resources online with normal google searches, the stored information from AI LLMS provided invaluable insight.

### Parts of the Proposal Developed Without AI Assistance
The initial project concept for the Personalized Learning Platform was developed without any AI. Along with the Motivation section, the preliminary database schema design, and the breakdown of responsibilities of our team members.

### Specific Tasks That AI Helped With
AI was used to help refine the Tentative Plan by transforming our high-level goals into a structured 3-week sprint. It also assisted in providing ideas for technical libraries and third-party APIs that we could incorporate for our advanced features implementations.

### One Idea Where AI input Influenced Our Proposal
One case was where AI suggested a development schedule that suggested working through the Real-Time and External API advanced feature setup and implementation in the first two weeks to ensure there would be enough time for debugging.
	
While this suggestion made by AI was ideal with regards to handling the advanced features, our team needed to adjust it based on our personal academic commitments to other courses. We provided AI with context regarding some of our other important deadlines happening in the month of March to get a better schedule planning. This sparked a discussion between us about the tradeoff of either having technical momentum and burnout by the end of the project or finishing the project ahead of time and leaving off more time to spend preparing for the presentation.

Ultimately, we decided to push the complex integration tasks into Week 3 which will allow us to focus on the MVP during the weeks we have more time. This ensures that the nice-to-have features are addressed after the major deliverables are finished.
