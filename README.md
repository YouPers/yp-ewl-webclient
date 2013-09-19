yp-ewl-webclient
================

Webclient of the YouPers eWorkLife service


To build this project:

- git clone "project url"
- cd yp-ewl-webclient

- npm install   (installs all needed software for build system: defined in package.json)

Build commands:

"grunt": tests, compiles and builds the distribution version of the whole project, is used by CI
            is executing "grunt jshint", "grunt test", and "grunt build"

"grunt server": does all needed css compilation and starts a development server and opens default browser.
            Watches all files and recompiles and reloads when changes occur


"grunt server:dist": builds the distribution version of the project, starts a local server and opens a browser to
            test the distribution Version.

