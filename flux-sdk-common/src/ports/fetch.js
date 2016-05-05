let fetchPolyfill = null;

function setFetch(polyfill) {
  fetchPolyfill = polyfill;
}

function fetchWrapper(...args) {
  return (fetchPolyfill || window.fetch)(...args);
}

export {
  setFetch,
  // The naming is handled this way to not clobber window.fetch.
  // TODO(daishi): Document our usage of fetch in some README.
  fetchWrapper as fetch,
};
