# README #

This project is a boilerplate for Eko's homework assignment.

## Requirements ##

The boilerplate includes a simple web page which includes an HTML5 Video Element and placeholders for **functionality you will need to implement:**

* Play/Pause toggle functionality
* Progress indication - update the time label as the video plays
* Views counter
* Like/Dislike functionality - click to to update counter

Use [Firebase Realtime Database](https://firebase.google.com/products/realtime-database/) Web API to implement the views and like/dislike across sessions and viewers.

## How do I get set up? ##

* Get the boilerplate (clone the repo or simply download as a zip)
* Setup a local development environment (e.g. [http-server](https://www.npmjs.com/package/http-server))
* The Firebase project has been setup in advance, you only to update the `DATABASE_URL_PLACEHOLDER` in the code with the one you were provided with in the email.
* Start coding!

## Things to consider ##

* Make sure that the UI and the video's state are in sync
* What is the single source of truth for the data?
* How do you make sure the data in the DB is sound when multiple users are using the voting system at the same time
* How does the project gets packed/bundled (see [webpack](https://webpack.github.io/) or [Rollup](https://rollupjs.org/))
* How would you test your functionality? (we recommend [Jest](https://jestjs.io/))

## What are we looking for? ##

* Code that works according to the requirements
* Understanding of JavaScript fundamentals
* Modular design
* Attention to detail
* Ability to self-learn working with new APIs and web services
* Clear, beautiful and properly documented code

Nice to have:

* Make the video controls prettier ([Sass](https://sass-lang.com/) would be highly appreciated)

## How do I submit? ##

Simply send us a zip file and instructions how to run your project once unpacked

## Good luck! ##
