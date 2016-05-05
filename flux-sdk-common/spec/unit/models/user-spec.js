import User from '../../../src/models/user';
import * as projectModule from '../../../src/models/project';
import * as dataTableModule from '../../../src/models/data-table';
import * as cellModule from '../../../src/models/cell';
import * as typeCheckers from '../../../src/utils/schema-validators';
import * as requestUtils from '../../../src/utils/request';
import * as profileSerializer from '../../../src/serializers/profile-serializer';
import credentialsFactory from '../../factories/credentials-factory';

describe('models.User', function() {
  beforeEach(function() {
    spyOn(typeCheckers, 'checkUser').and.callThrough();
    spyOn(requestUtils, 'authenticatedRequest').and.returnValue(Promise.resolve('RESPONSE'));
    spyOn(User, 'serializeProfile').and.returnValue('SERIALIZED');

    this.credentials = credentialsFactory();
    this.user = new User(this.credentials);
  });

  describe('#constructor', function() {
    it('should validate the required parameters', function() {
      expect(typeCheckers.checkUser).toHaveBeenCalledWith({
        credentials: this.credentials,
      });
    });
  });

  describe('#fetchProfile', function() {
    beforeEach(function(done) {
      this.user.fetchProfile().then(response => { this.response = response; })
        .then(done, done.fail);
    });

    it("should fetch the user's details", function() {
      expect(requestUtils.authenticatedRequest).toHaveBeenCalledWith(
        this.credentials, 'api/whoami/');
    });

    it('should serialize the response', function() {
      expect(User.serializeProfile).toHaveBeenCalledWith('RESPONSE');
      expect(this.response).toEqual('SERIALIZED');
    });
  });

  describe('#listProjects', function() {
    beforeEach(function() {
      spyOn(projectModule.default, 'listProjects').and.returnValue('USER_PROJECTS');
    });

    it("should use the user's credentials to list their projects", function() {
      const projects = this.user.listProjects();

      expect(projects).toEqual('USER_PROJECTS');
      expect(projectModule.default.listProjects)
        .toHaveBeenCalledWith(this.credentials);
    });
  });

  describe('#getProject', function() {
    beforeEach(function() {
      this.fakeProject = {};
      spyOn(projectModule, 'default').and.returnValue(this.fakeProject);
    });

    it("should use the user's credentials to instantiate a project", function() {
      const project = this.user.getProject('PROJECT_ID');

      expect(projectModule.default).toHaveBeenCalledWith(this.credentials, 'PROJECT_ID');
      expect(project).toBe(this.fakeProject);
    });
  });

  describe('#getDataTable', function() {
    beforeEach(function() {
      this.fakeDataTable = {};
      spyOn(dataTableModule, 'default').and.returnValue(this.fakeDataTable);
    });

    it("should use the user's credentials to instantiate a data table", function() {
      const dataTable = this.user.getDataTable('DATA_TABLE_ID');

      expect(dataTableModule.default).toHaveBeenCalledWith(this.credentials, 'DATA_TABLE_ID');
      expect(dataTable).toBe(this.fakeDataTable);
    });
  });

  describe('#getCell', function() {
    beforeEach(function() {
      this.fakeCell = {};
      spyOn(cellModule, 'default').and.returnValue(this.fakeCell);
    });

    it("should use the user's credentials to instantiate a cell", function() {
      const cell = this.user.getCell('DATA_TABLE_ID', 'CELL_ID');

      expect(cellModule.default).toHaveBeenCalledWith(this.credentials, 'DATA_TABLE_ID', 'CELL_ID');
      expect(cell).toBe(this.fakeCell);
    });
  });

  describe('#createProject', function() {
    beforeEach(function() {
      spyOn(projectModule.default, 'createProject').and.returnValue('CREATED_PROJECT');
    });

    it("should use the user's credentials to create the project", function() {
      const project = this.user.createProject('NEW PROJECT', { app: 'SOME-APP' });

      expect(projectModule.default.createProject)
        .toHaveBeenCalledWith(this.credentials, 'NEW PROJECT', { app: 'SOME-APP' });
      expect(project).toEqual('CREATED_PROJECT');
    });
  });

  describe('#getWhoami', function() {
    it('should be deprecated in favour of #getProfile');
  });

  describe('#setWhoami', function() {
    it('should be deprecated');
  });
});

describe('models.User.static', function() {
  it('should use the correct default serializers', function() {
    expect(User.serializeProfile).toEqual(profileSerializer.default);
  });

  describe('#isLoggedIn', function() {
    beforeEach(function() {
      spyOn(typeCheckers, 'checkUser');
    });

    describe('when the credentials are valid', function() {
      beforeEach(function() {
        spyOn(User, 'serializeProfile').and.returnValue('SERIALIZED');
        spyOn(requestUtils, 'authenticatedRequest');

        this.credentials = credentialsFactory();
      });

      it('should try to get their profile', function(done) {
        requestUtils.authenticatedRequest.and.returnValue(Promise.resolve({}));

        User.isLoggedIn(this.credentials)
          .then(() => {
            expect(requestUtils.authenticatedRequest)
              .toHaveBeenCalledWith(this.credentials, 'api/whoami/');
          })
          .then(done, done.fail);
      });

      describe('when the token is valid', function() {
        beforeEach(function() {
          requestUtils.authenticatedRequest.and.returnValue(Promise.resolve({}));
        });

        it('should return true', function(done) {
          User.isLoggedIn(this.credentials)
            .then(isLoggedIn => {
              expect(isLoggedIn).toEqual(true);
            })
            .then(done, done.fail);
        });
      });

      describe('when the token is invalid', function() {
        beforeEach(function() {
          requestUtils.authenticatedRequest.and.returnValue(Promise.reject('some error'));
        });

        it('should return false', function(done) {
          User.isLoggedIn(this.credentials)
            .then(isLoggedIn => {
              expect(isLoggedIn).toEqual(false);
            })
            .then(done, done.fail);
        });
      });
    });

    describe('when the credentials are invalid', function() {
      it('should return false', function(done) {
        User.isLoggedIn({ bad: 'nonono' })
          .then(isLoggedIn => {
            expect(isLoggedIn).toEqual(false);
          })
          .then(done, done.fail);
      });
    });
  });
});
