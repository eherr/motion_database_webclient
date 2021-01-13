# Motion Database Web Client

Web client for the [motion database server](https://github.com/eherr/motion_database_server) written using the angular framework. It integrates a [Unity WebGL app](https://github.com/eherr/motion_database_unity_client) to view the animations in the browser. 
Part of the code is based on the following tutorials:  
https://jasonwatmore.com/post/2018/10/29/angular-7-user-registration-and-login-example-tutorial  
https://medium.com/@ryanchenkie_40935/angular-authentication-using-route-guards-bf7a4ca13ae3  
  
## Setup Instructions

1. Install [Node.js](https://nodejs.org)

2. Install [Angular JS](https://angular.io/)
```bat
npm install @angular/cli @angular/core @angular-devkit/build-angular
```

3. Go into repository directory and build or debug the application.
```bat
ng build/serve
```


## Debugging and updating of the Unity application

New builds of the Unity WebGL app need to be copied into /assets/Unity/Build.  


## License
Copyright (c) 2019 DFKI GmbH.  
MIT License, see the LICENSE file.
