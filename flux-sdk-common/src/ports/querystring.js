let qsParse = null;
let qsStringify = null;

function setQueryEncoders(parseFn, stringifyFn) {
  qsParse = parseFn;
  qsStringify = stringifyFn;
}

function parseQuery(string) { return qsParse(string); }

function stringifyQuery(string) { return `?${qsStringify(string)}`; }

export {
  setQueryEncoders,
  parseQuery,
  stringifyQuery,
};
