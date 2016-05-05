let encode = null;
let decode = null;

function setBase64Encoders(encodeFn, decodeFn) {
  encode = encodeFn;
  decode = decodeFn;
}

function base64Encode(string) { return encode(string); }

function base64Decode(string) { return decode(string); }

export {
  setBase64Encoders,
  base64Encode,
  base64Decode,
};
