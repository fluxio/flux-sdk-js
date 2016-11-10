const DataTable = require('flux-sdk-common/lib/models/data-table');

describe('Project', function() {
  describe('instance methods', function() {
    beforeAll(function(done) {
      this.sdk.Project.createProject(this.credentials, 'ORIGINAL NAME')
        .then(({ original: { id } }) => {
          this.projectId = id;
          this.project = new this.sdk.Project(this.credentials, id);
        })
        .then(done, done.fail);
    });

    afterAll(function(done) {
      this.project.delete().then(done, done.fail);
    });

    describe('#listUsers', function() {
      beforeAll(function(done) {
        this.project.listUsers()
          .then(entities => {
            this.projectUsers = entities;
          }).then(done, done.fail);
      });

      it('should receive the list of users on the project', function(done) {
        expect(this.projectUsers).toEqual(jasmine.any(Array));
        expect(this.projectUsers.length).toBeGreaterThan(0);
        this.user.fetchProfile(profile => {
          expect(this.projectUsers[0].id).toEqual(profile.id);
        }).then(done, done.fail);
      });
    });

    describe('#share/#unshare', function() {
      beforeAll(function(done) {
        let otherUser = '';
        if (this.userProfile.email.includes('+camper@flux.io')) {
          otherUser = `${this.userProfile.email.split('+')[0]}@flux.io`;
        } else {
          otherUser = `${this.userProfile.email.split('@')[0]}+camper@flux.io`;
        }
        // The following line throws an error if it fails.
        this.project.share(otherUser, 'collaborator')
          .then(done, done.fail);
      });

      afterAll(function(done) {
        this.project.listUsers()
          .then(entities => {
            for (let i = 0, len = entities.length; i < len; i++) {
              (entity => {
                if (entity.permission === 'collaborator') {
                  this.project.unshare(entity.id);
                }
              })(entities[i]);
            }
          })
          .then(done, done.fail);
      });

      it('should work', function() {
        expect(true).toBe(true);
      });
    });

    describe('#fetch', function() {
      beforeAll(function(done) {
        this.project.fetch()
          .then(({ original, transformed }) => {
            this.original = original;
            this.transformed = transformed;
          })
          .then(done, done.fail);
      });

      it('should receive a valid project', function() {
        expect(this.original.id).toEqual(this.projectId);
        expect(this.original.name).toEqual('ORIGINAL NAME');
        expect(this.original.creator_id).toEqual(this.userProfile.id);
        expect(this.original.creator).toEqual(this.userFullName);
        expect(this.original.created_at).toEqual(jasmine.any(String));
        expect(this.original.last_updated).toEqual(jasmine.any(String));
      });

      it('should transform the project correctly', function() {
        expect(this.transformed.id).toEqual(this.original.id);
        expect(this.transformed.name).toEqual(this.original.name);
        expect(this.transformed.creatorId).toEqual(this.original.creator_id);
        expect(this.transformed.creatorName).toEqual(this.original.creator);
        expect(this.transformed.timeCreated).toEqual(new Date(this.original.created_at));
        expect(this.transformed.timeUpdated).toEqual(new Date(this.original.last_updated));
      });
    });

    describe('#delete', function() {
      it('is tested implicitly in the cleanup', function() {
        expect(true).toEqual(true);
      });
    });

    describe('#getDataTable', function() {
      beforeEach(function() {
        this.fakeDataTable = {};
        spyOn(DataTable, 'default').and.returnValue(this.fakeDataTable);
      });

      it('should return a DataTable', function() {
        const dataTable = this.project.getDataTable();

        expect(dataTable).toEqual(this.fakeDataTable);
        expect(DataTable.default).toHaveBeenCalledWith(this.credentials, this.projectId);
      });
    });
  });

  describe('static methods', function() {
    describe('#createProject', function() {
      beforeAll(function(done) {
        this.sdk.Project.createProject(this.credentials, 'NEW PROJECT')
          .then(({ original, transformed }) => {
            this.original = original;
            this.transformed = transformed;
          })
          .then(done, done.fail);
      });

      afterAll(function(done) {
        const project = new this.sdk.Project(this.credentials, this.transformed.id);

        project.delete().then(done, done.fail);
      });

      it('should receive the new project', function() {
        expect(this.original.id).toEqual(jasmine.any(String));
        expect(this.original.name).toEqual('NEW PROJECT');
        expect(this.original.creator_id).toEqual(this.userProfile.id);
        expect(this.original.creator).toEqual(this.userFullName);
        expect(this.original.created_at).toEqual(jasmine.any(String));
        expect(this.original.last_updated).toEqual(jasmine.any(String));
      });

      it('should transform the new project', function() {
        expect(this.transformed.id).toEqual(this.original.id);
        expect(this.transformed.name).toEqual(this.original.name);
        expect(this.transformed.creatorId).toEqual(this.original.creator_id);
        expect(this.transformed.creatorName).toEqual(this.original.creator);
        expect(this.transformed.timeCreated).toEqual(new Date(this.original.created_at));
        expect(this.transformed.timeUpdated).toEqual(new Date(this.original.last_updated));
      });
    });

    describe('#listProjects', function() {
      beforeAll(function(done) {
        this.sdk.Project.createProject(this.credentials, 'seed project')
          .then(project => {
            this.seedProject = project;
          })
          .then(done, done.fail);
      });

      beforeAll(function(done) {
        this.sdk.Project.listProjects(this.credentials)
          .then(({ original, transformed }) => {
            this.original = original;
            this.transformed = transformed;
          })
          .then(done, done.fail);
      });

      afterAll(function(done) {
        const project = new this.sdk.Project(this.credentials, this.seedProject.transformed.id);
        project.delete().then(done, done.fail);
      });

      it("should receive the user's projects", function() {
        expect(this.original).toEqual(jasmine.any(Array));
        expect(this.original.length).toBeGreaterThan(0);

        const seed = this.original.find(project => (project.id === this.seedProject.original.id));
        const expected = this.seedProject.original;

        // The list endpoint uses only a subset of the keys returned when a project is created.
        expect(seed.id).toEqual(expected.id);
        expect(seed.name).toEqual(expected.name);
        expect(seed.creator_id).toEqual(expected.creator_id);
      });

      it('should transform the response', function() {
        expect(this.transformed.entities).toEqual(jasmine.any(Array));
        expect(this.transformed.entities.length).toEqual(this.original.length);
        expect(this.transformed.entities).toContain(this.seedProject.transformed);
      });
    });
  });
});
