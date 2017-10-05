export default function copyFields(dst, src) {
    for (let i=0, keys=Object.keys(src), len=keys.length; i<len; i++) {
        dst[keys[i]] = src[keys[i]];
    }
    return dst;
}