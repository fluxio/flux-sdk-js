import { checkComment } from '../../utils/schema-validators';

function serialize(comment) {
    checkComment(comment);
    return comment;
}

function serializeList(comments) {
    return comments.map(serialize);
}

export {
    serialize,
    serializeList,
};
