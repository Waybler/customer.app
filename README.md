# General
This application is built by CaCharge on the Ionic framework. The current framework in use is Angular, thought this may change in the future.

# Vendors
This application can easily be modified by other vendors to customise it to their own look and feel, with a few slight modifications. 
Instructions on how to do this can be found under  **[resources/vendor](./resources/vendor/README.md)**.

#Ionic documentation
https://ionicframework.com/docs/angular/overview

### Show available commands
```
ionic --help
```


## Run application
https://ionicframework.com/docs/cli/commands/serve
```
ionic serve
 
 # Run on other port, or with other options
ionic serve --port=8101 --hmr --livereload --external
 
 # Run a configuration already in the package.json file
npm run start8101
```

## ionic cordova/capacitor build

https://ionicframework.com/docs/cli/commands/build

This builds the application without running it.
```
# Build the project
ionic build 

# Build with verbose output
ionic build --verbose
 
# Build the project and create an Android apk file
ionic cordova build android --verbose
```

## ionic cordova/capacitor platform
https://ionicframework.com/docs/cli/commands/cordova-platform/

```
 # Show platforms installed and available
ionic cordova platforms
```
```
 # Add platform
ionic cordova platform add android
ionic capacitor add  android
```

## ionic cordova/capacitor run - run on certain platform
https://ionicframework.com/docs/cli/commands/cordova-run
```
ionic cordova run android
ionic capacitor  run android

# To list android emulators
ionic cordova run android --list
ionic capacitor  run android --list

# To run a certain android emulator
ionic cordova run android --target="Pixel_2_API_30"
ionic capacitor  run android --target="Pixel_2_API_30"
```
### Run on browser with cordova platform
```
ionic cordova run browser --hmr --livereload --external
ionic capacitor  run browser --hmr --livereload --external
```

### Run on real/physical device
https://ionicframework.com/docs/developing/android

Before proceeding, make sure that you can build android with the commands listed above. It is also a good idea to change the servers listed
in environment.ts to either live servers or others accessible outside your computer.

1. Connect your phone to your computer and set it to developer mode and USB debugging
2. Run
```
adb devices
```
You should see your device on the list
3. Run
```
 ionic cordova run android --list
 ionic capacitor  run android --list
```
You should see the target name of your device
4. Run
```
ionic cordova run android --target="26bebbe719021ece"
ionic capacitor  run android --target="26bebbe719021ece"
```
5. Add domain
   Add the IP address of your computer to the file "network_security_config.xml" in order to be able to run from your local environment.

This file can be found under "resources/android/network_security_config.xml" under <domain-config>.
```
ionic cordova run android --target="26bebbe719021ece"
ionic capacitor  run android --target="26bebbe719021ece"
```
The target should be the name of the device listed previously. If everything is set up correctly, your device should run.
### Run on a device with live reload
https://ionicframework.com/docs/cli/livereload
```
     ionic cordova run android --target="Pixel_2_API_30" --livereload
# or
     ionic cordova run android --target="Pixel_2_API_30" --livereload --host="10.10.0.201"

# For capacitor
     ionic capacitor run android --target="Pixel_2_API_30" --livereload
# or
     ionic capacitor run android --target="Pixel_2_API_30" --livereload --host="10.10.0.201"

# Use 0.0.0.0
     ionic cordova run android --target="Pixel_2_API_30" --livereload --host="0.0.0.0"
or for capacitor
     ionic capacitor run android --target="Pixel_2_API_30" --livereload --host="0.0.0.0"
#You will be prompted for an external address if you run with 0.0.0.0.

# INFO: Switch out the target ID for your own. The device can be emulated or physical.
# NOTE: The device must be on the same network, so if you are using a physical device you must connect 
to the wireless network matching your development computer.

``` 


### Deploying to a Device
https://ionicframework.com/docs/v3/intro/deploying/

```
ionic cordova run android --prod --release
# or
ionic cordova build android --prod --release

# For capacitor
ionic capacitor run android --prod --release
# or
ionic capacitor build android --prod --release
``` 
This will minify your app’s code, use the minified code for the Ionic build and also remove any debugging capabilities from the APK. This is generally used when deploying an app to the Google Play Store.

### Debugging  a Device
Write the following in the address bar.
```
chrome://inspect#devices
``` 
Instructions can be found here: [Remote debug Android devices](https://developer.chrome.com/docs/devtools/remote-debugging/).

The device has to be running using live-reload.


## Repair ionic project
This deletes already fetched dependencies as well as any platform folders and reinstalls all dependencies for
the application.
 ```
 ionic repair
```

## Angular CLI
https://angular.io/cli

Remove all ionic-related stuff
 ```
 ionic repair
```
## Git clean
Sometimes we want to clean a folder and remove all that is not in version control.

 ```
# Do a dry run first, in order to see what will be erased
git clean -fxd -e .idea -n

# Remove all unversioned stuff, but keep the .idea folder
git clean -fxd -e .idea

In this case, .idea represents a folder which we would like to exclude from the operation
```
## Remote debug Android devices
https://developer.chrome.com/docs/devtools/remote-debugging/
 ```
 
```
It is a good idea to use the "-e" option, in order to keep folders related to the IDE or other such folders that you would like not to be erased.
# Error resolution
## Build-tool 31.0.0 is missing DX
Solution is to copy the files named d8 and rename them to dx. (https://stackoverflow.com/a/68844136)

# Markdown syntax
[CommonMark](https://commonmark.org/help/)

[Make a README](https://www.makeareadme.com/)


# Links
[How to update Cordova](https://ionic.zone/cordova/update)

# Demo

 
