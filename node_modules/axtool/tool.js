var fs = require("fs");
var cp = require("child_process");
var { isString, isNullOrUndefined } = require("util");

//提示
var log = exports.log = function (...args) {
    console.log(...args);
};

//获取JSON
exports.requireJson = function (file) {
    if (fs.existsSync(file)) {
        return require(file);
    }
    return {};
};

exports.getType = function (o) {
    var _t; return ((_t = typeof (o)) == "object" ? o == null && "null" || Object.prototype.toString.call(o).slice(8, -1) : _t).toLowerCase();
};

exports.duoTai = function (methods, args) {
    var types = [];
    Array.from(args).forEach(x => {
        !isNullOrUndefined(x) && types.push(exports.getType(x).slice(0, 3));
    });
    var mm;
    for (var m in methods) {
        if (methods.hasOwnProperty(m)) {
            mm = m.split("_");
            var isHit = types.every(function (x, i) {
                return mm[i].toLowerCase().includes(x);
            });
            if (isHit) {
                return methods[m](...args);
            }
        }
    }
    throw "arguments type is not match!";
};

var cmdMethod = {
    strArr_fun: function (cmdExp, callback) {
        var ops = {
            args: cmdExp
        };
        return this.obj_fun(ops, callback);
    },
    strArr_str_fun: function (cmdExp, dir, callback) {
        var ops = {
            args: cmdExp
        };
        if (dir) {
            ops.dir = dir;
        }
        return this.obj_fun(ops, callback);
    },
    obj_fun: function (ops, callback) {
        if (isString(ops.args)) {
            ops.args = ops.args.split(/\s+/);
        }
        process.argv.indexOf("--show") > -1 && log("cmd:", ops.args.join(" "));
        return [ops, callback];
    }
};

//spawn封装
//ops类型: String/Array/PlainObject
exports.cmd = function () {
    var [ops, callback] = exports.duoTai(cmdMethod, arguments);

    var args = ops.args;
    var cmdName = args.shift();
    if (cmdName == "npm" && process.platform == "win32") {
        cmdName = "npm.cmd"
    }
    ops.shell = ops.shell !== false;
    ops.stdio = ops.stdio || "inherit";
    if (ops.dir) {
        ops.cwd = ops.dir;
    }


    ops.stdio = ops.stdio || "inherit";
    if (callback) {
        var sp = cp.spawn(cmdName, args, ops);
        sp.on("data", data => {
            log("data:", data.toString());
        });
        sp.on("error", data => {
            log("error:", data.toString());
        });
        sp.on('close', code => {
            callback(code !== 0);
        });
    } else {
        cp.spawnSync(cmdName, args, ops);
    }
};

//同步返回结果
exports.getCmd = function () {
    var [ops, callback] = exports.duoTai(cmdMethod, arguments);
    var args = ops.args;
    var cmdName = args.shift();
    if (cmdName == "npm" && process.platform == "win32") {
        cmdName = "npm.cmd"
    }
    ops.shell = ops.shell !== false;
    if (ops.dir) {
        ops.cwd = ops.dir;
    }
    // 以上同cmd,待优化
    return cp.spawnSync(cmdName, args, ops).stdout.toString().trim();
};

//同步返回结果
exports.cmdSync_bak = function (cmdExp) {
    var sudo = process.platform != "win32" && process.env.USER != "root" ? "sudo " : "";
    sudo = !cmdExp.includes("sudo") && cmdExp.includes("npm") && cmdExp.includes("-g") && sudo || "";
    process.argv.indexOf("--show") && log(`cmd: ${cmdExp}`);
    return cp.execSync(sudo + cmdExp).toString().trim();
};

//提示并退出
exports.end = function (message) {
    message && log(message);
    process.exit();
};

//获取当前分支
exports.getCurrentBranch = function (dir) {
    return exports.getCmd("git rev-parse --abbrev-ref HEAD", dir);
};

//获取本地IP
exports.getLocalIp = exports.getClientIp = function () {
    var ret = [];
    try {
        var ips = require("os").networkInterfaces();
        for (var k in ips) {
            var a = ips[k];
            for (var j = 0; j < a.length; j++) {
                var o = a[j];
                if (o.family == "IPv4" && o.internal === false) {
                    ret.push(o.address);
                }
            }
        }

    } catch (e) { }
    return ret.join("/") || "localhost";
};

//获取参数列表
exports.getArgs = function () {
    var keys = arguments;
    var argv = process.argv.slice(2);
    var args = {};
    args.more = [];
    argv.forEach(function (kv, i) {
        kv = kv.split("=");
        var k = kv[0];
        var v = kv[1];
        if (kv.length == 2) {
            if (/\./.test(k)) {
                exports.parseDot(args, k.split("."), v);
            } else {
                args[k] = exports.parseDou(v);
            }
        } else if (/^\-\-(\w+)$/.test(k)) {
            args[RegExp.$1] = true;
        } else if (/^\-(\w+)$/.test(k)) {
            RegExp.$1.split("").forEach(function (k2) {
                args[k2] = true;
            });
        } else {
            if (keys[i]) {
                args[keys[i]] = k;
            } else {
                args.more.push(k);
            }
        }
    });
    return args;
};

//解析多个.相隔开的key
exports.parseDot = function (args, kk, v) {
    var k = kk.shift();
    if (kk.length > 0) {
        args[k] = args[k] || {};
        exports.parseDot(args[k], kk, v);
    } else {
        args[k] = exports.parseDou(v);
    }
};

//解析多个,相隔开的value
exports.parseDou = function (v) {
    return v; //暂时不解析逗号
    //return /,/.test(v) ? v.split(",") : v;
};

//字节大小格式化
exports.byteFormat = function (byte, i = 0, n = 10) {
    var units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB", "DB", "NB"];
    if (byte < Math.pow(2, n) || i == units.length - 1) {
        var num = byte / Math.pow(2, n - 10);
        return num.toFixed(2) * 100 / 100 + units[i];
    }
    return exports.byteFormat(byte, i + 1, n + 10);
};


exports.read = function (prompt, callback) {
    process.stdout.write(prompt + ':');
    process.stdin.resume();
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', function (chunk) {
        process.stdin.pause();
        callback(chunk.replace(/[\r\n]/g, ''));
    });
};

exports.getCode = function (file) {
    return fs.readFileSync(file).toString().trim();
};

exports.setCode = function (file, code) {
    fs.writeFileSync(file, code.trim());
};

//删除目录
exports.rmdir = function (path) {
    if (fs.existsSync(path)) {
        var files = fs.readdirSync(path);
        files.forEach(function (file) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                exports.rmdir(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

//复制(深度)
exports.copy = function (dir, dstDir) {
    dir = dir.replace(/\/$/, "");
    dstDir = dstDir.replace(/\/$/, "");

    var dir2 = dstDir + "/" + dir.split("/").slice(-1)[0];
    fs.mkdirSync(dir2);
    fs.readdirSync(dir).forEach(function (file) {
        log(dir + "/" + file);
        //exports.copyFile(dir+"/"+file, dir2+"/"+file);
    });
};

//复制文件
exports.copyFile = function (src, dst) {
    fs.createReadStream(src).pipe(fs.createWriteStream(dst));
};

Object.assign(exports, require("./ip"));