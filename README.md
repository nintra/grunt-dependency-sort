                      _                           _                            ____             _
                   __| | ___ _ __   ___ _ __   __| | ___ _ __   ___ _   _     / ___|  ___  _ __| |_
                  / _` |/ _ \ '_ \ / _ \ '_ \ / _` |/ _ \ '_ \ / __| | | |____\___ \ / _ \| '__| __|
                 | (_| |  __/ |_) |  __/ | | | (_| |  __/ | | | (__| |_| |_____|__) | (_) | |  | |_
                  \__,_|\___| .__/ \___|_| |_|\__,_|\___|_| |_|\___|\__, |    |____/ \___/|_|   \__|
                            |_|                                     |___/

*grunt-dependency-sort* orders files in a path and replaces the minimatch path with an array of resolved file paths.

## Example

    concat: {
        dist: {
            src     : '<%= meta.folders.js %>**/*.js',
            depsort : 'src',
            dest    : '<%= meta.folders.js %>page.js'
        }
    },

    ...

    grunt.loadNpmTasks('grunt-dependency-sort');

Run *depsort* before all other tasks.




Dependencies need to be defined in an _dependencies.json in base directory of current path.<br>(e.g. in <%= meta.folders.js %>)

    {
        "almond" : [
        ],

        "jquery" : [
        ],

        "underscore" : [
        ],

        "underscore.string" : [
            "underscore"
        ],

        "jquery.ui" : [
            "jquery"
        ]
    }

Not mentioned and required files are appended to the ordered list.
