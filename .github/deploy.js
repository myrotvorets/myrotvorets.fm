#!/usr/bin/env node

const { Octokit } = require("@octokit/rest");
const { execSync } = require('child_process');
require('dotenv').config();

const ref = execSync('git rev-parse HEAD').toString('utf-8').trim();

const octokit = new Octokit({
    auth: process.env.DEPLOY_TOKEN
});

octokit.repos.createDeployment({
    owner: 'myrotvorets',
    repo: 'myrotvorets.fm',
    ref,
    auto_merge: false
});
