# Motion Database Web Client

Web client for the [motion database server](https://github.com/eherr/motion_database_server) written using the angular framework. It integrates a [Unity WebGL app](https://github.com/eherr/motion_database_unity_client) to view the animations in the browser. 
Part of the code is based on the following tutorials:  
https://jasonwatmore.com/post/2018/10/29/angular-7-user-registration-and-login-example-tutorial  
https://medium.com/@ryanchenkie_40935/angular-authentication-using-route-guards-bf7a4ca13ae3  
  
## Setup Instructions

1. Install the Node Version Manager according to this guide: https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/

2. Install the NodeJS version using nvm.
```bat
nvm install 18.10.0
nvm use 18.10.0
```

3. Go into repository directory and install the requirements.
```bat
npm install
```

4.  Build or debug the application using angular cli.
```bat
ng build/serve
```


## Debugging and updating of the Unity application

New builds of the Unity WebGL app need to be copied into /assets/Unity/Build.  


## License
Copyright (c) 2019 DFKI GmbH.  
MIT License, see the LICENSE file.
