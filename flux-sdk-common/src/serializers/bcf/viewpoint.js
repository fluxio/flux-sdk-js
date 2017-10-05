import { checkViewpoint } from '../../utils/schema-validators';

function serialize(viewpoint) {
    checkViewpoint(viewpoint);
    return viewpoint;
}

function serializeList(viewpoints) {
    return viewpoints.map(serialize);
}

export {
    serialize,
    serializeList,
};
