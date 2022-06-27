const {getInput} = require('@actions/core');
const {context} = require('@actions/github');

module.exports = {
  token: getInput('token', {required: true}),
  folderInput: getInput('folder', {required: false}),
  excludeInput: getInput('exclude', {required: false}),
  context,
};