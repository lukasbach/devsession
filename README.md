# DevSession
[![Build Status](https://travis-ci.com/lukasbach/devsession.svg?branch=master)](https://travis-ci.com/lukasbach/devsession)

Open-Source collaborative IDE with many features and extremely quick setup!

Currently work-in-progress/early alpha, but you can try it out with ``npx devsession`` in
the directory in which you want to start a coding session, or by downloading the GUI starter
from the [earliest release](https://github.com/lukasbach/devsession/releases/latest).

More details are available on the devsession website: 
[https://lukasbach.github.io/devsession/](https://lukasbach.github.io/devsession/)

## Building/Contributing

The project is set up as a monorepo using Lerna. 

 * To start developing, run ``yarn && yarn start`` in the root directory. This will start
   a development server for the backend and the frontend and automatically recompile if
   changes are detected. The backend starts on port 8020, the frontend on port 3000.
   To debug, open the frontend from the url:
   ``http://localhost:3000/?adminkey=adminkey&backend=http://localhost:8020``
   
 * To run a new build, run ``yarn && yarn build``. This will build the common package,
   the backend, the frontend, the website and the guistarter app.
   
 * To release a new version, run ``yarn && yarn pub``. This will build everything, bump
   versions for all packages, upload new versions for the packages which are deployed
   on npm and commit and push the version bumps. The CI pipeline will pick that up and
   redeploy the website and attach the guistarter binaries with the github release.
   
## Acknowledgements

Notable third-party frameworks used are:

 * Microsofts Monaco as editor frontend
 * Microsofts Typescript as primary programming language
 * Facebooks React for frontend development
 * Redux and Palantirs Redoodle for state management
 * Palantirs BlueprintJs as UI library
 * ExpressJS for the backend
 * Socket.io for real-time communication between frontend and backend
 * Electron for creating a standalone binary of the GUI starter
 * ngrok and localtunnel as built-in port-forwarding service
 * Node-pty for running terminals in the backend
 * xterm for displaying terminals in the frontend
 
 ...as well as many others.