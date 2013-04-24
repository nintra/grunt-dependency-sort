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


'use strict';

module.exports = function(grunt) {

    var path      = require('path'),
        fs        = require('fs'),
        _         = grunt.util._,
        topoSort  = require('toposort');

    // iterate through grunt config and search for 'dep-sort' keys
    grunt.registerTask('depsort', '´depsort´ by _dependencies.json', function() {

        var keyLimit = arguments.length && _.values(arguments),
            keyObj,

            iterate = function(list){
                _.each(list,function(value,key){
                    if(key === 'depsort' && list[value.key]){
                        var basePath = value.cwd ? grunt.template.process(value.cwd) : '';
                        list[value.key] = sortFiles(list[value.key],value.ext,value.cwd);

                        grunt.log.oklns('ordered files ('+list[value.key].length+'):');
                        _.each(list[value.key],function(path,file){
                            console.log(path.replace(basePath,''));
                        });
                    }

                    if(_.isObject(value)){
                        iterate(value);
                    }
                });
            };


        if(keyLimit){
            keyObj = grunt.config.data;
            _.each(keyLimit,function(key){
                if(!keyObj[key]){
                    grunt.fail.fatal('Could not resolve key! '+keyLimit.join('.'));
                }
                keyObj = keyObj[key];
            });

            iterate(keyObj);
        }else{
            iterate(grunt.config.data);
        }
    });


    /*
        @param directory {String} path/template string
        @return {Array} of resolved file paths
     */
    function sortFiles(directory,extension,cwd) {

        var pDirectory  = grunt.template.process(_.isArray(directory) ? directory.join(',') : directory).split(','),

            files       = grunt.file.expand(pDirectory),
            fileList    = [],
            orderedList = [],
            prependList = [],
            appendList  = [],

            basePath    = cwd ? grunt.template.process(cwd) : path.dirname(pDirectory[0]).replace('**',''),
            depFile     = '_dependencies.json',
            deps        = {},

            edges       = [],
            order       = [];

        // set basePath
        if(!cwd){
            _.each(files,function(filePath){
                var dir = path.dirname(filePath)+'/';

                if(!basePath || basePath.length > dir.length){
                    basePath = dir;
                }
            });
        }

        // create list of filename : path
        _.each(files,function(filePath){
            if(path.basename(filePath) !== depFile){
                fileList.push({
                    name : _.str.rtrim(filePath.replace(basePath,''),extension || path.extname(filePath)),
                    path : filePath
                });
            }
        });


        deps = fs.existsSync(basePath+depFile) && grunt.file.readJSON(basePath+depFile);
        if(deps){

            //update prepend / append
            fileList = _.filter(fileList,function(item,key){
                var pIndex,aIndex;

                if(deps.prepend){
                    pIndex = deps.prepend.indexOf(item.name);
                    if(pIndex > -1){
                        prependList[pIndex] = item.path;
                        return false;
                    }
                }

                if(deps.append){
                    aIndex = deps.append.indexOf(item.name);
                    if(aIndex > -1){
                        appendList[aIndex] = item.path;
                        return false;
                    }
                }

                return true;
            });

            prependList = _.compact(prependList);
            appendList = _.compact(appendList);

            // load files defined in deps
            Object.keys(deps).forEach(function(file){
                if(file != 'prepend' && file != 'append'){
                    _.each(deps[file],function(dep){
                        edges.push([file,dep]);
                    });
                }
            });

            // sort by dependencies
            order = topoSort(edges);
            order.reverse();



            // create array of sorted file paths
            orderedList = _.map(order,function(value){
                var path  = false,i;

                //filter already ordered files out
                for(i=0;i<fileList.length;i++){
                    if(grunt.file.isMatch({ /*matchBase: true, dot: true*/ },value,fileList[i].name)){

                        path = fileList[i].path;
                        fileList.splice(i,1);
                        break;
                    }
                }

                return path;
            });
            orderedList = _.compact(orderedList);

            // prepend files
            orderedList = prependList.concat(orderedList);

            // append files not mentioned in deps
            orderedList = orderedList.concat(_.pluck(fileList,'path'));

            // append files
            orderedList = orderedList.concat(appendList);
        }else{

            grunt.log.writeln('no '+depFile+' file specified in '+basePath);
        }

        return orderedList;
    };

};