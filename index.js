#!/bin/env node

/* AADecode - Decode encoded-as-aaencode JavaScript program.
 * 
 * Copyright (C) 2010,2016 @cat_in_136
 * 
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
const fs = require("fs");
const path = require("path");
const minimist = require("minimist");
const AADecode = require("./aadecode.js");

var argv = minimist(process.argv.slice(2), {
    "string": ["output"],
    "boolean": ["help", "version"],
    "alias": {
        h: "help",
        o: "output",
        v: "version"
    }
});

if (argv.help) {
    process.stdout.write("Usage: aadecode [OPTION]... [FILE]\n");
    process.stdout.write(" -o, --output=FILE    output to FILE\n");
    process.stdout.write(" -h, --help           display this help and exit\n");
    process.stdout.write(" -v, --version        output version information and exit\n");
    process.exit(0);
} else if (argv.version) {
    const pkg = require("./package.json");
    process.stdout.write(pkg.name + " " + pkg.version + "\n");
    process.exit(0);
} else {
    (function () {
        if (argv._.length == 0) {
            return new Promise(function (resolve, reject) {
                var text = "";
                process.stdin.setEncoding("utf8");
                process.stdin.on("readable", function () {
                  text += process.stdin.read() || "";
                });
                process.stdin.on("end", function () {
                  resolve(text);
                });
                process.stdin.on("error", function (error) {
                  reject(error);
                });
            });
        } else {
            return new Promise(function (resolve, reject) {
                fs.readFile(path.resolve(argv._[0]), function (error, text) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(text.toString());
                    }
                });
            });
        }
    })().then(function (text) {
        if (argv.output) {
            return new Promise(function (resolve, reject) {
                fs.writeFile(argv.output, AADecode.decode(text), function (error) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        } else {
            process.stdout.write(AADecode.decode(text));
            return Promise.resolve();
        }
    }).then(function () {
        process.exit();
    }).catch(function (error) {
        console.error(error);
        process.exit(1);
    });
}
