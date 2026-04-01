# ECE1724 Project: Demokritos

A full-stack personalized learning platform.

## Team Information
David Zhang  
Tyler Sun, 1007457645, tyl.sun@mail.utoronto.ca  
Rohan   

---

## Motivation

Online learning has become a significant part of modern education thanks to higher flexiblity and cost-effectiveness, especially after the global pandemic. However, online learning poses unique challenges which can limit its effectiveness compared to in-person learning. Difficulties from online learning can arise from limited opportunities for in-person interactions and more ways to lose focus and motivation due to a differing environment. As such, it can be tough for teachers to properly pass along information and for students to truly learn new material efficiently through remote means. Our team chose this project with the goal of creating a new accessible and user-tailored online learning platform which address these barriers present in online learning today. Instructors will be able to create course on topics they are passionate about, and students will be able to enroll in courses on their own allowing both teachers and students to engage in material they are passionate about. With intuitive and streamlined course management on both ends, Demokritos aims to break down current barriers in online learning so both instructors and students can have a more positive online learning experience.

## Objectives

Demokritos, meaning "chosen of the people", aims to serve as an online, user friendly learning platform providing a customizable learning experience for students and a flexible central hub for instructors. The website should be designed for the user experience of instructors and students alike, meaning users should have designated permissions and roles in each of their courses depending on if they are a teacher or student for the course. Proper user authentication and a comprehensive user schema with user roles will be needed to achieve this.

Instructors should be able to create their own courses, upload relevant course material or links, and create assessments through in class quizzes or assignments. Students should be able to find open courses and enroll in classes of interest. In enrolled classes, they should be able to view published course modules, upload files to respond to assignments and answer quizzes posted by the teacher. Both parties will be able to engage with each other quickly and seamlessly through real time discussion for easy question and answer sessions if needed.

## Technical Stack

The application is developed with a full stack approach using Next.js.

Frontend: React framework with Tailwind CSS for styling and shadcn/ui components
Backend: Next.js API routes
Database: PostgreSQL with Prisma ORM schema
File Management: Google Cloud Storage
Authentication: Better Auth
External APIs:

    Google Calendar API
    Veracity Learning API for quiz analytics
    Google Gemini API for an autograding option

Infrastructure: SSE (server-sent events) for real time discussion

Frontend and backend components are implemented with TypeScript. Playweight is used for end-to-end testing.

## Features

Users are able to register for an account and login to that account using any email. Once authenticated, users are able to explore the course marketplace showing open courses, enroll in open courses and create their own course for others. If a user creates a new course for the marketplace, they are assigned as an instructor for that course, and if a user enrolls in someone else's course, they are assigned a student role.

Instructors can:
- Edit course description and delete course
- Create teaching, assignment, or quiz modules
- Edit or delete existing modules
- Set deadlines for quizzes and assignments which can be seen on the course schedule
- View assignment submissions and grade them manually or using the Gemini autograder
- View quiz submissions and track class analytics

Students can:
- View modules and published course material
- Submit PDF files for assignments
- Take quiz attempts and submit quiz answers

Both students and instructors can browse the course schedule and sync it to their Google Calendar, as well as engage with each other by posting in the course discussion.

## User Guide

The report should clearly and concisely cover the following aspects:

    Team Information: List the names, student numbers, and preferred email addresses of all team members. Make sure these email addresses are active as they may be used for clarification requests.

    Motivation: Explain why your team chose this project, the problem it addresses, and its significance.

    Objectives: State the project objectives and what your team aimed to achieve through the implementation.

    Technical Stack: Describe the technologies used, including the chosen approach (Next.js Full-Stack or Express.js Backend), database solution, and other key technologies.

    Features: Outline the main features of your application and explain how they fulfill the course project requirements and achieve your objectives.

    User Guide: Provide clear instructions for using each main feature, supported with screenshots where appropriate.

    Development Guide: Include steps to set up the development environment, covering
        Environment setup and configuration
        Database initialization
        Cloud storage configuration
        Local development and testing

    Deployment Information (if applicable): Provide the live URL of your application and relevant deployment platform details.

    AI Assistance & Verification (Summary): If AI tools contributed to your project, provide a concise, high-level summary demonstrating that your team:
        Understands where and why AI tools were used
        Can evaluate AI output critically
        Verified correctness through technical means

    Specifically, briefly address:
        Where AI meaningfully contributed (e.g.,architecture exploration, database queries, debugging, documentation)
        One representative mistake or limitation in AI output (details should be documented in ai-session.md)
        How correctness was verified (e.g., manual testing of user flows, logs, unit or integration tests)

    Do not repeat full AI prompts or responses here. Instead, reference your ai-session.md file for concrete examples.

    Individual Contributions: Describe the specific contributions of each team member, aligning with Git commit history.

    Lessons Learned and Concluding Remarks: Share insights gained during development and any final reflections on the project experience.



