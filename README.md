          _                           _                            ____             _
       __| | ___ _ __   ___ _ __   __| | ___ _ __   ___ _   _     / ___|  ___  _ __| |_
      / _` |/ _ \ '_ \ / _ \ '_ \ / _` |/ _ \ '_ \ / __| | | |____\___ \ / _ \| '__| __|
     | (_| |  __/ |_) |  __/ | | | (_| |  __/ | | | (__| |_| |_____|__) | (_) | |  | |_
      \__,_|\___| .__/ \___|_| |_|\__,_|\___|_| |_|\___|\__, |    |____/ \___/|_|   \__|
                |_|                                     |___/

´grunt-dependency-sort´ orders files in a path and replaces the minimatch path with an
array of resolved file paths.

## Example

    concat: {
        dist: {
            src : '<%= meta.folders.js_lib %>**/*.js',
            'dep-sort' : 'src',
            dest : '<%= meta.folders.js %><%= meta.filenames.js_lib %>.js'
        }
    },

    ...

    grunt.loadNpmTasks('grunt-dependency-sort');

Run 'dep-sort' before all other tasks.



Dependencies need to be defined in an _dependencies.json file.

    {
        "almond" : [
            "kendo"
        ],

        "jquery" : [
        ],

        "underscore" : [
        ],

        "underscore.string" : [
            "underscore"
        ],

        "kendo" : [
            "jquery"
        ]
    }

Not mentioned and required files are appended to the ordered list.