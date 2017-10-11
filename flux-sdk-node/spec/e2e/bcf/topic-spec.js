describe('Topic', function() {
  beforeAll(function(done) {
    this.user.createProject('BCF TOPIC TEST PROJECT')
      .then(({ transformed: { id } }) => {
        this.dataTableId = id;
        this.project = this.user.getProject(id);
        // TODO Websocket notification tests.
        // this.dataTable = this.project.getDataTable(id);
      })
      .then(() => {
        return this.user.fetchProfile()
        .then(({ transformed: { email } }) => {
          this.email = email;
        });
      })
      .then(done, done.fail);
  });

  afterAll(function(done) {
    this.project.delete().then(done, done.fail);
  });

  describe('instance methods', function() {
    beforeAll(function() {
      this.topicTitle = 'JS SDK Test';
      this.topicDescription = 'a test topic';
      this.topicAssignedTo = this.email;
      this.topic = null;
    });

    afterAll(function() {
      // TODO(alcorn) Delete topic here if/when topic deletion is implemented by
      // the issue service this.topic.delete().then(done, done.fail);
    });

    describe('#createTopic', function() {
      it('should create a topic', function(done) {
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

    describe('#createTopics', function() {
      const title = (id) => `group0topic${id}`;
      it('should create multiple topics', function(done) {
        this.project.createTopics([{
          title: title(0),
        }, {
          title: title(1),
        }])
        .then((newTopics) => {
          expect(newTopics.length).toEqual(2);
          const titles = newTopics.map((t) => t.title);
          expect(titles).toContain(title(0));
          expect(titles).toContain(title(1));
        })
        .then(done, done.fail);
      });
    });

    describe('#getTopics', function() {
      it('should list topics', function(done) {
        this.project.getTopics()
        .then((topics) => {
          expect(topics.length >= 0).toBe(true);
        })
        .then(done, done.fail);
      });
    });

    describe('#fetch', function() {
      const state = {
        title: 'test #fetch',
        topic: null,
      };
      beforeAll(function(done) {
        this.project.createTopic({
          title: state.title,
        })
        .then((newTopic) => {
          state.topic = newTopic;
        })
        .then(done, done.fail);
      });
      it('should fetch a topic', function(done) {
        state.topic.fetch()
        .then(function(topic) {
          expect(topic.title).toEqual(state.title);
        })
        .then(done, done.fail);
      });
    });

    describe('#update', function() {
      const state = {
        title0: 'test #update',
        title1: 'it works!',
        topic: null,
      };
      beforeAll(function(done) {
        this.project.createTopic({
          title: state.title0,
        })
        .then((newTopic) => {
          state.topic = newTopic;
        })
        .then(done, done.fail);
      });
      it('should update the topic', function(done) {
        state.topic.update({
          title: state.title1,
        })
        .then((updatedTopic) => {
          expect(updatedTopic.title).toEqual(state.title1);
        })
        .then(done, done.fail);
      });
    });
  });
});
