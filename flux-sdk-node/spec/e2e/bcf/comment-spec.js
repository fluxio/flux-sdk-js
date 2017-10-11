describe('Comment', function() {
  beforeAll(function(done) {
    this.user.createProject('BCF COMMENT TEST PROJECT')
    .then(({ transformed: { id } }) => {
      this.project = this.user.getProject(id);
      return this.project.createTopic({
        title: 'test comments',
      })
      .then((newTopic) => {
        this.topic = newTopic;
      });
    })
    .then(done, done.fail);
  });

  afterAll(function(done) {
    this.project.delete()
    .then(done, done.fail);
  });

  describe('instance methods', function() {
    describe('#createComment', function() {
      it('should create a comment', function(done) {
        const commentText = 'this is a test';
        this.topic.createComment({
          comment: commentText,
        })
        .then((comment) => {
          expect(comment.comment).toEqual(commentText);
        })
        .then(done, done.fail);
      });
    });

    describe('#fetch', function() {
      it('should fetch the comment', function(done) {
        const commentText = 'this is a test';
        this.topic.createComment({
          comment: commentText,
        })
        .then((comment) => {
          return comment.fetch();
        })
        .then((comment) => {
          expect(comment.comment).toEqual(commentText);
        })
        .then(done, done.fail);
      });
    });

    describe('#update', function() {
      it('should update the comment', function(done) {
        const commentText = 'this should get updated';
        const updatedText = 'it was!';
        this.topic.createComment({
          comment: commentText,
        })
        .then((comment) => {
          return comment.update({
            comment: updatedText,
          });
        })
        .then((comment) => {
          expect(comment.comment).toEqual(updatedText);
        })
        .then(done, done.fail);
      });
    });

    describe('#getComments', function() {
      it('should get a list of comments', function(done) {
        this.topic.getComments()
        .then((comments) => {
          expect(comments.length >= 0).toBe(true);
        })
        .then(done, done.fail);
      });
    });
  });
});
