// Generated on 2013-09-18 using generator-angular 0.4.0
'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

var clientconfig = {
        mock: {
            backendUrl: 'http://localhost:8000/api/v1'
        },
        dev: {
            backendUrl: 'http://localhost:8000/api/v1'
        },
        ci: {
            backendUrl: 'http://yp-backend-ci.herokuapp.com/api/v1'
        },
        test: {
            backendUrl: 'http://yp-backend-test.herokuapp.com/api/v1'
        },
        uat: {
            backendUrl: 'https://test.youpers.com/v1'
        },
        prod: {
            backendUrl: 'https://api.youpers.com/v1'
        }
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };

    try {
        yeomanConfig.app = require('./bower.json').appPath || yeomanConfig.app;
    } catch (e) {
    }

    grunt.initConfig({
        yeoman: yeomanConfig,
        watch: {
            coffee: {
                files: ['<%= yeoman.app %>/js/{,*/}*.coffee'],
                tasks: ['coffee:dist']
            },
            coffeeTest: {
                files: ['test/spec/{,*/}*.coffee'],
                tasks: ['coffee:test']
            },
            recess: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.less'],
                tasks: ['recess:server', 'autoprefixer']
            },
            styles: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
                tasks: ['copy:styles', 'autoprefixer']
            },
            template: {
                files: ['<%= yeoman.app %>/index.html'],
                tasks: ['template:<%=clientMode%>']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= yeoman.app %>/{,*/}*.html',
                    '.tmp/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.app %>}/js/{,*/}*.js', '{.tmp,<%= yeoman.app %>}/js/{,*/}*.json',
                    '<%= yeoman.app %>/assets/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        autoprefixer: {
            options: ['last 1 version'],
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '.tmp/styles/',
                        src: '{,*/}*.css',
                        dest: '.tmp/styles/'
                    }
                ]
            }
        },
        connect: {
            options: {
                port: process.env.PORT || 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: '0.0.0.0'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test')
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, yeomanConfig.dist)
                        ];
                    }
                }
            },
            heroku: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'app')
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= connect.options.port %>'
            }
        },
        clean: {
            dist: {
                files: [
                    {
                        dot: true,
                        src: [
                            '.tmp',
                            '<%= yeoman.dist %>/*',
                            '!<%= yeoman.dist %>/.git*'
                        ]
                    }
                ]
            },
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/js/{,*/}*.js'
            ]
        },
        coffee: {
            options: {
                sourceMap: true,
                sourceRoot: ''
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>/js',
                        src: '{,*/}*.coffee',
                        dest: '.tmp/js',
                        ext: '.js'
                    }
                ]
            },
            test: {
                files: [
                    {
                        expand: true,
                        cwd: 'test/spec',
                        src: '{,*/}*.coffee',
                        dest: '.tmp/spec',
                        ext: '.js'
                    }
                ]
            }
        },
        recess: {
            options: {
                compile: true
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>',
                        src: ['styles/{,*/}*.less', 'lib/elements/*.less'],
                        dest: '.tmp/',
                        ext: '.css'
                    }
                ]
            },
            server: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>',
                        src: ['styles/{,*/}*.less', 'lib/elements/*.less'],
                        dest: '.tmp/',
                        ext: '.css'
                    }
                ]
            }
        },
        // not used since Uglify task does concat,
        // but still available if needed
        /*concat: {
         dist: {}
         },*/
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/js/{,*/}*.js',
                        '<%= yeoman.dist %>/styles/{,*/}*.css'
//                        '<%= yeoman.dist %>/assets/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                    ]
                }
            }
        },
        useminPrepare: {
            html: '.tmp/index.html',
            options: {
                root: 'app',
                dest: '<%= yeoman.dist %>'
            }
        },
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
            options: {
                dirs: ['<%= yeoman.dist %>']
            }
        },
        imagemin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>/assets',
                        src: '{,*/}*.{png,jpg,jpeg}',
                        dest: '<%= yeoman.dist %>/assets'
                    }
                ]
            }
        },
        svgmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>/assets',
                        src: '{,*/}*.svg',
                        dest: '<%= yeoman.dist %>/assets'
                    }
                ]
            }
        },
        cssmin: {
            // By default, your `index.html` <!-- Usemin Block --> will take care of
            // minification. This option is pre-configured if you do not wish to use
            // Usemin blocks.
            // dist: {
            //   files: {
            //     '<%= yeoman.dist %>/styles/main.css': [
            //       '.tmp/styles/{,*/}*.css',
            //       '<%= yeoman.app %>/styles/{,*/}*.css'
            //     ]
            //   }
            // }
        },
        htmlmin: {
            dist: {
                options: {
                    removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    // collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>',
                        src: ['partials/*.html'],
                        dest: '<%= yeoman.dist %>'
                    },
                    {'dist/index.html': '.tmp/index.html'}
                ]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= yeoman.app %>',
                        dest: '<%= yeoman.dist %>',
                        src: [
                            '*.{ico,png,txt}',
                            '.htaccess',
                            'lib/**/*',
                            'assets/{,*/}*.{gif,webp}',
                            'styles/fonts/{,*/}*.woff',
                            'js/mockdata/*'
                        ]
                    },
                    {
                        expand: true,
                        cwd: '.tmp/assets',
                        dest: '<%= yeoman.dist %>/assets',
                        src: [
                            'generated/*'
                        ]
                    }
                ]
            },
            styles: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>/styles',
                        dest: '.tmp/styles/',
                        src: '{,*/}*.{css,woff}'
                    }
                ]
            }
        },
        concurrent: {
            server: [
                'coffee:dist',
                'recess:server',
                'copy:styles'
            ],
            test: [
                'coffee',
                'recess',
                'copy:styles'
            ],
            dist: [
                'coffee',
                'recess:dist',
                'copy:styles',
                'imagemin',
                'svgmin',
                'htmlmin'
            ]
        },
        karma: {
            unit: {
                configFile: 'config/karma.conf.js',
                singleRun: true
            }
        },
        cdnify: {
            dist: {
                html: ['<%= yeoman.dist %>/*.html']
            }
        },
        ngmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>/js',
                        src: '*.js',
                        dest: '<%= yeoman.dist %>/js'
                    }
                ]
            }
        },
        uglify: {

        },
        'template': {
            'options': {
                // Task-specific options go here
            },
            'mock': {
                'options': {
                    'data': {
                        mockscripts: "<script src='js/mockdata/backendMockApp.js'></script>" +
                                      "<script src='lib/angular/angular-mocks.js'></script>" +
                                      "<script src='js/mockdata/MockDataJson.js'></script>" +
                                      "<script src='js/mockdata/testactivities.js'></script>",
                        ngappsuffix: '-devmock',
                        config:     clientconfig.mock
                    }
                },
                'files': {
                    '.tmp/index.html': ['app/index.html']
                }
            },
            'server': {
                'options': {
                    'data': {
                        mockscripts: "",
                        ngappsuffix: '',
                        config: clientconfig[process.env.NODE_ENV || 'dev']
                    }
                },
                'files': {
                    '.tmp/index.html': ['app/index.html']
                }
            }

        }
    });

    grunt.registerTask('server', function (target) {
        grunt.config('clientMode', target || 'server');

        if (target === 'dist') {
            return grunt.task.run(
                ['build',
                 'open',
                 'connect:dist:keepalive']);
        } else if (target === 'mock') {
            return grunt.task.run([
                'clean:server',
                'concurrent:server',
                'template:' +  grunt.config('clientMode'),
                'autoprefixer',
                'connect:livereload',
                'open',
                'watch'
            ]);
        } else {
            return grunt.task.run([
                'clean:server',
                'concurrent:server',
                'template:'+  grunt.config('clientMode'),
                'autoprefixer',
                'connect:livereload',
                'open',
                'watch'
            ]);
        }

    });

    grunt.registerTask('mock', [
        'server:mock'
    ]);

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'template:mock',
        'autoprefixer',
        'connect:test',
        'karma'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'template:server',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
        'concat',
        'copy:dist',
        'cdnify',
        //'ngmin',
        'cssmin',
        'uglify',
        //'rev',
        'usemin'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);

    grunt.registerTask('heroku:production', ['concurrent:server','template:server',
        'autoprefixer']);
    grunt.registerTask('heroku:development', ['concurrent:server','template:server',
        'autoprefixer']);

};
