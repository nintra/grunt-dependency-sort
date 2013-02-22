/*!
 * grunt-dependency-sort
 * Copyright (c) 2013 by Oliver Liermann <liermann@strg-agency.de>
 *
 * MIT LICENSE
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


//************replace reject
'use strict';

module.exports = function(grunt) {

    var path     = require('path'),
        _        = require('underscore'),
        topoSort = require('topoSort');

    // iterate through grunt config and search for 'dep-sort' keys
    grunt.registerTask('depsort', '´depsort´ by _dependencies.json', function() {

        var iterate = function(list){
            _.each(list,function(value,key){
                if(key === 'depsort'){
                    console.log('path: '+list[value]);
                    list[value] = sortFiles(list[value]);
                    console.log('ordered files:\n', list[value]);
                }

                if(_.isObject(value)){
                    iterate(value);
                }
            });
        };

        iterate(grunt.config.data);
    });


    /*
        @param directory {String} path/template string
        @return {Array} of resolved file paths
     */
    function sortFiles(directory) {

        var files    = grunt.file.expand(grunt.template.process(directory)),
            fileList = [],

            basePath = '',
            depFile  = '_dependencies.json',
            deps     = {},

            edges    = [],
            order    = [];


        // create list of filename : path
        // set basePath
        _.each(files,function(filePath){
            var dir = path.dirname(filePath)+'/';

            if(!basePath || basePath.length > dir.length){
                basePath = dir;
            }

            if(path.basename(depFile) === depFile){
                return;
            }

            fileList.push({
                name : path.basename(filePath,path.extname(filePath)),
                path : filePath
            });
        });


        deps = fs.existsSync(basePath+depFile) && grunt.file.readJSON(basePath+depFile);
        if(deps){

            // load files defined in deps
            Object.keys(deps).forEach(function(file){
                edges.push([file].concat(deps[file]));
            });


            // sort by dependencies
            order = topoSort(edges);
            order.reverse();

            // create array of sorted file paths
            files = _.map(order,function(value){
                var path;

                fileList = _.reject(fileList,function(item){
                    if(item.name === value){
                        path = item.path;
                    }

                    return item.name === value;
                });

                return path;
            });

            // append files not mentioned in deps
            files = files.concat(_.pluck(fileList,'path'));
        }else{

            grunt.log.writeln('no '+depFile+' file specified in '+basePath);
        }

        return files;
    };

};