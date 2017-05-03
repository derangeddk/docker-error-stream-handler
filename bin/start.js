#!/usr/bin/env node

const DockerErrorStreamHandler = require("../index");
const dockerErrorStreamHandler = new DockerErrorStreamHandler();
dockerErrorStreamHandler.start();
