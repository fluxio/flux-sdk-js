describe('Topic', function() {
  beforeAll(function(done) {
    this.user.createProject('BCF TEST PROJECT')
      .then(({ transformed: { id } }) => {
        this.dataTableId = id;
        this.project = this.user.getProject(id);
        this.dataTable = this.project.getDataTable(id);
      })
      .then(() => {
        return this.user.fetchProfile()
        .then(({ transformed: { email } }) => {
          this.email = email;
        })
      })
      .then(done, done.fail);
  });

  afterAll(function(done) {
    this.project.delete().then(done, done.fail);
  });

  describe('instance methods', function() {
    beforeAll(function() {
      this.topicTitle = 'JS SDK Test'
      this.topicDescription = 'a test topic';
      this.topicAssignedTo = this.email;
      this.topic = null;
    });

    afterAll(function() {
      // TODO(alcorn) Delete topic here if/when topic deletion is implemented by the issue service
      // this.topic.delete().then(done, done.fail);
    });

    describe('#createTopic', function() {
      it('should create a topic successfully', function(done) {
        this.project.createTopic({
          title: this.topicTitle,
          description: this.topicDescription,
          assignedTo: this.topicAssignedTo,
        })
        .then((newTopic) => {
          expect(!!newTopic).toBe(true);
          this.topic = newTopic;
          expect(newTopic.title).toEqual(this.topicTitle);
          expect(newTopic.description).toEqual(this.topicDescription);
          expect(newTopic.assignedTo).toEqual(this.topicAssignedTo);
        })
        .then(done, done.fail);
      });
    });
  });
});
