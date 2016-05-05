import { DEBUG } from '../config';

const called = {};

function formatWarning(fnName, newFnName) {
  return `\`${fnName}\` has been deprecated. Please use \`${newFnName}\` instead.`;
}

function deprecated(fnName, newFnName, { message }) {
  if (DEBUG && !called[fnName]) {
    /* eslint-disable no-console */
    console.error((message || formatWarning)(fnName, newFnName));
    /* eslint-enable no-console */
    called[fnName] = true;
  }
}

export default deprecated;
