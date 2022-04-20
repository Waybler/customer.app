![Image text](https://cacharge.com/wp-content/uploads/2018/10/cc-logga-1.png)
## Table of Contents
1. [Customise the app](#customise)
2. [Files to modify](#files-to-modify)
* [Styling](#styling)
* [Vendor references](#vendor-references)
* [Config files](#config-files)
3. [FAQs](#faqs)
***
# <a name="customise"></a>Customise the app

The app is designed to be customisable and skinnable by other vendors with just a few slight modifications. Most of the app will be similar to the
CaCharge app but the look and feel will be different on account of optional changes to the load screen, background images, colours and company
references.
***

# <a name="files-to-modify"></a> Files to modify
## <a name="styling"></a> Styling
### global.scss
The background styling can be found in the file **[global.scss](../../src/global.scss)** directly under the **[src](../../src )** folder.


This file contains the app background and basic styling.

### variables.scss
The file  **[variables.scss](../../src/theme/variables.scss)** is found under  the **[src/theme](../../src/theme)** folder and is the only file in that folder.

This file can be used to set the app-wide colour scheme for buttons, modals and the like. There are settings for both the light theme - which is assumed to be the default - as well as a dark theme.
A change in one property ought to require consideration for changing the property in the alternate theme.

## <a name="vendor-references"></a>Vendor references
In the file '**[src/environments/environment.ts](../../src/environments/environment.ts)**' there is a property called ```vendor```.  For *CaCharge*, the values would, for example, be the following:
```
export const vendor = {
  vendorName: 'CaCharge', 
  vendorAppId: 'x-01',
  vendorSupportEmail: 'support@cacharge.com',
};
```
These values should be changed to match those of your organisation.

## <a name="config-files"></a>Config files
The file '**[config.xml](../../config.xml)**' contains configuration for the application. Among these are those which have to do with its publication. 
This includes the name of the application and it Codepush data.

You will typically have to change these. THe properties in question and their defaults are listed below
```
<widget android-versionCode="500011" id="com.customer.app" .../>

Default id is:
com.customer.app
```
```
<author email="hi@vendor.com" href="https://www.vendor.com/">CaCharge AB</author>

Default e-mail is:
hi@vendor.com

Default href is:
https://www.vendor.com/
```
For [appcenter ](https://appcenter.ms) via [CodePush ](https://microsoft.github.io/code-push/):
```
<preference name="APP_SECRET" value="APP_SECREET_FOR_YOUR_COMPANY" />
<preference name="CodePushDeploymentKey" value="CODEPUSH_DEPLOYMENT_KEY_FOR_YOUR_COMPANY" />

Default APP_SECRET is:
APP_SECREET_FOR_YOUR_COMPANY

Default CodePushDeploymentKey is:
CODEPUSH_DEPLOYMENT_KEY_FOR_YOUR_COMPANY

They are defined once for each platform - by default for android and ios.
```
All other references to vendor settings can be found by searching for the following strings:
```
com.customer.app
Vendor-Inc
```

 ***

# <a name="technologies"></a> Technologies
The app is built on the _Ionic platform_ with the *Angular* framework. The dependencies may change over time.

A list of technologies used within the project:
* [Ionic ](https://ionicframework.com/docs/angular/overview): Version in package.json
* [Angular ](https://angular.io/docs): Version in package.json
* [CodePush ](https://microsoft.github.io/code-push/): Used to deploy Web artifacts without having to redeploy the application to the app store.

The dependencies may change over time so you should refer to the values in the [package.json ](../../package.json) file. 

It is entirely possible to deploy without the use of [CodePush ](https://microsoft.github.io/code-push/) but that is the solution CaCharge uses to minimise app store deployments..
***

# Installation
A little intro about the installation.
```
$ git clone https://example.com
$ cd ../path/to/the/file
$ npm install
$ npm start
```

## Collaboration
Instructions on how to collaborate on the project.
***

> To be added as needed
## FAQs
***
A list of frequently asked questions, to be added as needed:
 

   | Topic | Question | Answer |
   |:--------------|:-------------:|--------------:|
   | text-align left | text-align center | text-align right |