let parse = null;

function setUrlParse(parseFn) {
  parse = parseFn;
}

function parseUrl(url) { return parse(url); }

function joinUrl(items) {
  return items.join('/')
    .replace(/([^:])\/([\/|#|\?])/g, (match, p1, p2) => `${p1}${p2}`)
    .replace(/\/*(#|\?)\/*/g, (match, p1) => p1);
}

export {
  setUrlParse,
  parseUrl,
  joinUrl,
};
