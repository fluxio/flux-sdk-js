// Must be imported via commonjs instead of es6 to access 'default' in tests
const Project = require('flux-sdk-common/lib/models/project');
const DataTable = require('flux-sdk-common/lib/models/data-table');
const Cell = require('flux-sdk-common/lib/models/cell');

describe('User', function() {
  describe('instance methods', function() {
    describe('#fetchProfile', function() {
      beforeAll(function(done) {
        this.user.fetchProfile()
          .then(({ original, transformed }) => {
            this.original = original;
            this.transformed = transformed;
          })
          .then(done, done.fail);
      });

      it('should receive a valid profile from the server', function() {
        expect(this.original.id).toEqual(jasmine.any(String));
        expect(this.original.email).toEqual(jasmine.any(String));
        expect(this.original.makerid).toEqual(jasmine.any(String));
        expect(this.original.display_name).toEqual(jasmine.any(String));
        expect(this.original.first_name).toEqual(jasmine.any(String));
        expect(this.original.last_name).toEqual(jasmine.any(String));
        expect(this.original.kind).toEqual(jasmine.any(String));
      });

      it('should transform the response correctly', function() {
        expect(this.transformed.id).toEqual(this.original.id);
        expect(this.transformed.email).toEqual(this.original.email);
        expect(this.transformed.makerId).toEqual(this.original.makerid);
        expect(this.transformed.displayName).toEqual(this.original.display_name);
        expect(this.transformed.firstName).toEqual(this.original.first_name);
        expect(this.transformed.lastName).toEqual(this.original.last_name);
        expect(this.transformed.kind).toEqual(this.original.kind);
      });
    });

    describe('#getProject', function() {
      beforeEach(function() {
        this.fakeProject = {};
        spyOn(Project, 'default').and.returnValue(this.fakeProject);
      });

      it('should return a Project', function() {
        const project = this.user.getProject('fake-project-id');

        expect(Project.default).toHaveBeenCalledWith(this.credentials, 'fake-project-id');
        expect(project).toBe(this.fakeProject);
      });
    });

    describe('#getDataTable', function() {
      beforeEach(function() {
        this.fakeDataTable = {};
        spyOn(DataTable, 'default').and.returnValue(this.fakeDataTable);
      });

      it('should return a DataTable', function() {
        const dataTable = this.user.getDataTable('fake-data-table-id');

        expect(DataTable.default).toHaveBeenCalledWith(this.credentials, 'fake-data-table-id');
        expect(dataTable).toBe(this.fakeDataTable);
      });
    });

    describe('#getCell', function() {
      beforeEach(function() {
        this.fakeCell = {};
        spyOn(Cell, 'default').and.returnValue(this.fakeCell);
      });

      it('should return a Cell', function() {
        const cell = this.user.getCell('fake-data-table-id', 'fake-cell-id');

        expect(Cell.default)
          .toHaveBeenCalledWith(this.credentials, 'fake-data-table-id', 'fake-cell-id');
        expect(cell).toBe(this.fakeCell);
      });
    });

    describe('#listProjects', function() {
      beforeEach(function() {
        this.fakeProjects = {};
        spyOn(Project.default, 'listProjects').and.returnValue(this.fakeProjects);
      });

      it("should list the user's projects", function() {
        this.user.listProjects();

        expect(Project.default.listProjects).toHaveBeenCalledWith(this.credentials);
      });
    });

    describe('#createProject', function() {
      beforeEach(function() {
        this.fakeProject = {};
        spyOn(Project.default, 'createProject').and.returnValue(this.fakeProject);
      });

      it('should return the new project', function() {
        const project = this.user.createProject('PROJECT NAME', { app: 'some app' });

        expect(project).toBe(this.fakeProject);
        expect(Project.default.createProject)
          .toHaveBeenCalledWith(this.credentials, 'PROJECT NAME', { app: 'some app' });
      });
    });
  });

  describe('static methods', function() {
    describe('#isLoggedIn', function() {
      describe('for a valid, logged in user', function() {
        it('should resolve to true', function(done) {
          this.sdk.User.isLoggedIn(this.credentials)
            .then(res => {
              expect(res).toEqual(true);
            })
            .then(done, done.fail);
        });
      });

      describe('for a valid, logged out user', function() {
        it('should resolve to false', function(done) {
          const credentials = {
            ...this.credentials,
            accessToken: 'FAKE_TOKEN',
          };

          this.sdk.User.isLoggedIn(credentials)
            .then(res => {
              expect(res).toEqual(false);
            })
            .then(done, done.fail);
        });
      });

      describe('for an invalid user', function() {
        it('should resolve to false', function(done) {
          const invalidCredentials = {
            foo: 'bar',
            accessToken: 'FAKE_TOKEN',
          };

          this.sdk.User.isLoggedIn(invalidCredentials)
            .then(res => {
              expect(res).toEqual(false);
            })
            .then(done, done.fail);
        });
      });
    });
  });
});
