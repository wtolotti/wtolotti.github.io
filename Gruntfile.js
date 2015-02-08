/* jshint node: true */
var config = require("grunt-settings");

module.exports = function(grunt) {
  // Initialize the configuration block.
  config.init(grunt);

  // Compress the CSS.
  config.set("cssmin.dist", {
      src: [
        "bower_components/bootstrap-sass/dist/css/bootstrap.css"
        ,"css/normalize.css"
        ,"css/main.css"
        ,"css/style.css"
      ]
    , dest: "public/css/style.css"
  });

  // Compress images.
  config.set("imagemin.dist", {
    files: [{
        expand: true
      , cwd: "img/"
      , src: ["**/*.{png,jpg,gif}"]
      , dest: "public/images/"
    }]
  });

  // Concatenate JavaScript files
  config.set("concat.dist", {
      src: jsFiles
    , dest: "public/js/script.js"
  });

  // Compress JavaScript
  var jsFiles = [
      "bower_components/jquery/dist/jquery.js"
    , "bower_components/bootstrap-sass/dist/js/bootstrap.js"
    , "js/plugins.js"
    , "js/main.js"
  ];

  config.set("uglify.dist", {
      options: {
          report: "gzip"
      }
    , src: jsFiles
    , dest: "public/js/script.js"
  });

  config.set("uglify.dev", {
      options: {
          sourceMap: true
        , sourceMapIncludeSources: true
        , beautify: true
        , mangle: false
      }
    , src: jsFiles
    , dest: "public/js/script.js"
  });

  // Watch for updates.
  config.set("watch.js", {
      files: ["js/**/*.js"]
    , tasks: ["uglify:dev"]
  });

  config.set("watch.css", {
      files: ["css/**/*.css"]
    , tasks: ["cssmin"]
  });

  // config.set("watch.images", {
  //     files: ["img/**/*"]
  //   , tasks: ["imagemin"]
  // });

  // Register the dev task, which skips minification.
  config.registerTask("dev", ["cssmin", "imagemin", "uglify:dev"]);

  // Register the default task.
  config.registerTask("default", ["cssmin", "imagemin", "uglify:dist"]);
};
