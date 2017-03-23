let parse = null;

function setUrlParse(parseFn) {
  parse = parseFn;
}

function parseUrl(url) { return parse(url); }

function joinUrl(...args) {
  return args.join('/')
    .replace(/([^:])\/([\/|#|\?])/g, (match, p1, p2) => `${p1}${p2}`)
    .replace(/\/*(#|\?)\/*/g, (match, p1) => p1);
}

export {
  setUrlParse,
  parseUrl,
  joinUrl,
};
