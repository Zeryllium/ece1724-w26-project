# Project Proposal

**Project Name:** MyLearn, a full-stack personalized learning platform

**Collaborators:** David Zhang, Tyler Sun, Rohan Datta

## Table of Contents

* [Motivation](#motivation)
    * [Background](#background)
    * [Problem Statement](#problem-statement)
    * [Challenge](#challenge)
* [Objective and Key Features](#objective-and-key-features)
    * [Objective](#objective)
    * [Key Features](#key-features)
    * [Advanced Features](#advanced-features)
    * [Evaluation Criteria](#evaluation-criteria)
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
    * [Parts of the Proposal That Were Developed Without AI Assistance](#parts-developed-without-ai-assistance)
    * [What Specific Tasks or Drafts Did AI Help With?](#specific-tasks-ai-helped-with)
    * [One Idea Where AI input Influenced Our Proposal](#idea-where-ai-influenced-proposal)

## Motivation

### Background

### Problem Statement

### Challenge

## Objective and Key Features

### Objective

### Key Features

### Advanced Features

### Evaluation Criteria

### Project Scope and Feasibility

## Tentative Plan

### Week-By-Week Plan
**Week 1: Core Infrastructure & Authentication**
Initializing the Next.js project with TypeScript, Tailwind CSS, and shadcn/ui will be done as well as setting up the PostgreSQL schema and connecting it via Prisma ORM. Implementing Better Auth for role-based access should also be done this week as well to ensure there is a clear distinction of the collection of pages each type of user has access to (Teacher and Student). The way we measure this week’s success will be having a working login system and basic dashboard layout.

**Week 2: Course Management & File Handling**
This week focuses on building some of the core functionalities for the Teacher user which is the “Course Creation” workflow. This is where Teachers can upload their text content and PDF uploads and maybe video content. Also building the Student actor’s “Course View” and enrollment logic is a goal for this week as we will be able to see noticeable change on the Student’s dashboard after Teachers make their course(s). Intuitively since we are working with getting the Teacher’s content to be uploadable, we will need to set up a cloud storage for keeping that educational material. The metric for success this week is if we can have a functioning CRUD for the courses and file persistence of the course materials.

**Week 3: Advanced Features, Testing and Validation**
As we are wrapping up on the key features of this project like the content builder for quizzes and assignments as well as the assignment submission page, we’ll be working on the advanced features. This week we’ll be implementing the Postgres LISTEN/NOTIFY triggers and Server-Set Events endpoints to get live notifications working. We’ll also be working on getting a Learning Record System (LRS) setup with a third-party and learning their API to integrate with our platform and send student activity logs through. How we’ll measure success this week’s end is by seeing if we have live notifications and the external APIs working as well as all of the other functionality of our platform operating as intended.

**Breakdown of Responsibilities**
To ensure we complete this project in an optimal manner, we are dividing the tasks to match each team member’s skill sets.

### David
- Responsible for the PostgreSQL schema design and implementation
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

### Data and State Design

### Feature Selection and Scope Decisions

### Anticipated Challenges

### Early Collaboration Plan

## AI Assistance Disclosure
We found AI to be incredibly useful with helping us create parts of our proposal, especially when we had trouble finding resources online with normal google searches, the stored information from AI LLMS provided invaluable insight.

### Parts of the Proposal That Were Developed Without AI Assistance
The initial project concept for the Personalized Learning Platform was developed without any AI. Along with the Motivation section, the preliminary database schema design, and the breakdown of responsibilities of our team members.

### What Specific Tasks or Drafts Did AI Help With?
AI was used to help refine the Tentative Plan by transforming our high-level goals into a structured 3-week sprint. It also assisted in providing ideas for technical libraries and third-party APIs that we could incorporate for our advanced features implementations.

### One Idea Where AI input Influenced Our Proposal
One case was where AI suggested a development schedule that suggested working through the Real-Time and External API advanced feature setup and implementation in the first two weeks to ensure there would be enough time for debugging.
	
While this suggestion made by AI was ideal with regards to handling the advanced features, our team needed to adjust it based on our personal academic commitments to other courses. We provided AI with context regarding some of our other important deadlines happening in the month of March to get a better schedule planning. This sparked a discussion between us about the tradeoff of either having technical momentum and burnout by the end of the project or finishing the project ahead of time and leaving off more time to spend preparing for the presentation.

Ultimately, we decided to push the complex integration tasks into Week 3 which will allow us to focus on the MVP during the weeks we have more time. This ensures that the nice-to-have features are addressed after the major deliverables are finished.
