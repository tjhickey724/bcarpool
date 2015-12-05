Package.describe({
  name: "mdg:geolocation-manually-modified",
  summary: "Provides reactive geolocation on desktop and mobile.",
  version: "1.1.0",
  git: "https://github.com/meteor/mobile-packages"
});

Cordova.depends({
  "cordova-plugin-geolocation": "1.0.1"
});

Package.on_use(function (api) {
  api.use(["reactive-var"]);
  api.versionsFrom("METEOR@1.2");
  api.use("isobuild:cordova@5.2.0");
  api.add_files(["geolocation.js"], "client");
  api.export("Geolocation", "client");
});
