yp-ewl-webclient
=================


Webclient of the YouPers eWorkLife service


To build this project:
-----------------------

- git clone "project url"
- cd yp-ewl-webclient

- npm install   (installs all needed software for build system: defined in package.json)

Build commands:

    grunt
tests, compiles and builds the distribution version of the whole project, is used by CI
is executing "grunt jshint", "grunt test", and "grunt build"

    grunt server
does all needed css compilation and starts a development server and opens default browser.
Watches all files and recompiles and reloads when changes occur

    grunt server
dist: builds the distribution version of the project, starts a local server and opens a browser to
test the distribution Version.


Continuous Deployment to Heroku:
--------------------------------

Just as a hint, so we don't forget how we made this running on heroku.
We are currently not checking our dist files into the repository, they are built using `grunt`. So when
we deploy to heroku, heroku needs to build our project. This is something heroku does not do in its default
configuration, it expects to get the final dist files. The following heroku configuration enables heroku to build
our project before running it.

tips from here https://github.com/mbuchetics/heroku-buildpack-nodejs-grunt

Create a new app with this buildpack:

    heroku create myapp --buildpack https://github.com/mbuchetics/heroku-buildpack-nodejs-grunt.git

Or add this buildpack to your current app:

    heroku config:add BUILDPACK_URL=https://github.com/mbuchetics/heroku-buildpack-nodejs-grunt.git

Add the sneaky option to enable config vars during compile:

    heroku labs:enable user-env-compile -a myapp

Set the NODE_ENV environment variable (e.g. development or production):

    heroku config:set NODE_ENV=production

Create your Node.js app and add a Gruntfile named Gruntfile.js (or Gruntfile.coffee if you want to use
CoffeeScript, or grunt.js if you are using Grunt 0.3) with a heroku task:

    grunt.registerTask('heroku:development', 'clean less mincss');

or

    grunt.registerTask('heroku:production', 'clean less mincss uglify');

Don't forget to add grunt to your dependencies in package.json. If your grunt tasks depend on other pre-defined
tasks make sure to add these dependencies as well:

````
"dependencies": {
    ...
    "grunt": "*",
    "grunt-contrib": "*",
    "less": "*"
}
```