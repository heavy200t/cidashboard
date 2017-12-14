"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var MongoService = (function () {
    // private baseUrl = 'http://shc-devops-master.hpeswlab.net:30030/api';
    function MongoService(http) {
        this.http = http;
        this.backend_server = process.env.BACKEND_SERVER;
        this.backend_port = process.env.BACKEND_PORT;
        this.baseUrl = "http://" + this.backend_server + ":" + this.backend_port + "/api";
    }
    MongoService.prototype.getFailsafeReports = function (jobName, buildId) {
        var url = this.baseUrl + "/failsafereports/" + jobName + "/" + buildId;
        return this.http.get(url);
    };
    MongoService.prototype.getDailyReports = function () {
        var url = this.baseUrl + "/dailyReports";
        console.log(url);
        return this.http.get(url);
    };
    MongoService.prototype.getJobList = function () {
        var url = this.baseUrl + "/jobs";
        return this.http.get(url);
    };
    MongoService.prototype.getBuilds = function (jobName) {
        var url = this.baseUrl + "/" + jobName + "/builds";
        return this.http.get(url);
    };
    MongoService = __decorate([
        core_1.Injectable()
    ], MongoService);
    return MongoService;
}());
exports.MongoService = MongoService;
