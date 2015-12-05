// This section sets up some basic app metadata,
// the entire section is optional.

App.launchScreens({
  'iphone': 'images/launch.png',
  //'iphone_2x': 'images/Default@2x~iphone.png',
  // ... more screen sizes and platforms ...
});

// Set PhoneGap/Cordova preferences
App.setPreference('HideKeyboardFormAccessoryBar', true);
App.setPreference("StatusBarOverlaysWebView", false);
//App.setPreference("StatusBarStyle", 'blacktranslucent');
App.setPreference("StatusBarBackgroundColor", '#0070FE');
App.setPreference("KeyboardDisplayRequiresUserAction",false);
App.setPreference('Orientation', 'default');
App.setPreference('Orientation', 'all', 'ios');

App.accessRule('*');