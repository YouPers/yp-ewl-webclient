# end to end (e2e) tests

End to end tests cover a realistic end user scenario and include all components of our system: both the backend and the frontend servers are running, a browser is available to load the page and test workflows like logging in and navigating through the states.

We are using Protractor for writing our tests, which are forwarded to a selenium server that controls the browser. 

They can be executed in two flavors: a lightweight and local chrome-only version and the full fledged e2e test that includes all major browsers, runs on a dedicated selenium instance and tests against the *cimaster* environment.

### protractor:chromeOnly

This version is included in the build target *test*. Prerequirements: Backend is running and Chrome is installed.

### protractor:all

This build targed will run automatically with every commit to the *master* branch, after the CircleCI build has finished successfully and has been deployed to the *cimaster* environment.

The tests are executed on a VM running Windows7 with IE9 (along with other browsers), that is currently hosted on the Thinkpad Edge in our office. You can connect to this VM using Microsoft Remote Desktop:

- Host: 10.111.111.14
- User: IEUser
- PW: Passw0rd!

## test files

The tests are located under 

	test/protractor


