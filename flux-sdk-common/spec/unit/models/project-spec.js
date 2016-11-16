import Project from '../../../src/models/project';
import * as DataTableModule from '../../../src/models/data-table';
import * as dataTableModule from '../../../src/models/data-table';
import * as schemaValidators from '../../../src/utils/schema-validators';
import * as requestUtils from '../../../src/utils/request';
import credentialsFactory from '../../factories/credentials-factory';

describe('models.Project', function() {
  beforeEach(function() {
    this.dataTableSpy = jasmine.createSpyObj('dataTable', ['openWebSocket', 'closeWebSocket']);

    spyOn(dataTableModule, 'default').and.returnValue(this.dataTableSpy);
    spyOn(Project, 'serialize').and.returnValue('SERIALIZED');
    spyOn(schemaValidators, 'checkProject').and.callThrough();
    spyOn(requestUtils, 'authenticatedRequest').and.returnValue(Promise.resolve('RESPONSE'));

    this.credentials = credentialsFactory();
    this.project = new Project(this.credentials, 'PROJECT_ID', {
      fluxUrl: 'FLUX_URL',
    });
  });

  describe('#constructor', function() {
    it('should validate the required parameters', function() {
      expect(schemaValidators.checkProject).toHaveBeenCalledWith({
        id: 'PROJECT_ID',
        credentials: this.credentials,
      });
    });
  });

  describe('#fetch', function() {
    beforeEach(function(done) {
      this.request = this.project.fetch()
        .then(response => {
          this.response = response;
        })
        .then(done, done.fail);
    });

    it('should fetch the project', function() {
      expect(requestUtils.authenticatedRequest).toHaveBeenCalledWith(
        this.credentials, 'p/PROJECT_ID/api/meta/');
    });

    it('should return the serialized projects', function() {
      expect(Project.serialize).toHaveBeenCalledWith('RESPONSE');
      expect(this.response).toEqual('SERIALIZED');
    });
  });

  describe('#getDataTable', function() {
    it('should instantiate a data table for the project', function() {
      const dataTable = this.project.getDataTable();

      expect(dataTableModule.default)
        .toHaveBeenCalledWith(this.credentials, 'PROJECT_ID');
      expect(dataTable).toBe(this.dataTableSpy);
    });
  });

  describe('#openWebSocket', function() {
    it("should open the project's web socket", function() {
      this.project.openWebSocket();

      expect(DataTableModule.default)
        .toHaveBeenCalledWith(this.credentials, 'PROJECT_ID');
      expect(this.dataTableSpy.openWebSocket).toHaveBeenCalled();
    });
  });

  describe('#closeWebSocket', function() {
    it("should close the project's web socket", function() {
      this.project.closeWebSocket();

      expect(DataTableModule.default).toHaveBeenCalledWith(this.credentials, 'PROJECT_ID');
      expect(this.dataTableSpy.closeWebSocket).toHaveBeenCalled();
    });
  });

  describe('#listUsers', function() {
    beforeEach(function(done) {
      this.request = this.project.listUsers()
        .then(response => {
          this.response = response;
        })
        .then(done, done.fail);
    });

    it('should list the project\'s users', function() {
      expect(requestUtils.authenticatedRequest).toHaveBeenCalledWith(
        this.credentials, 'api/v1/projects/PROJECT_ID/users/');
    });
  });

  describe('#share', function() {
    beforeEach(function(done) {
      this.request = this.project.share('test@flux.io', 'collaborator')
        .then(response => {
          this.response = response;
        })
        .then(done, done.fail);
    });

    it('should share the project with the given user', function() {
      expect(requestUtils.authenticatedRequest).toHaveBeenCalledWith(
        this.credentials, 'api/v1/projects/PROJECT_ID/users/', {
          method: 'post',
          form: {
            email: 'test@flux.io',
            permission: 'collaborator',
          },
        });
    });
  });

  describe('#unshare', function() {
    beforeEach(function(done) {
      this.request = this.project.unshare('USER_ID')
        .then(response => {
          this.response = response;
        })
        .then(done, done.fail);
    });

    it('should unshare the project with the given user', function() {
      expect(requestUtils.authenticatedRequest).toHaveBeenCalledWith(
        this.credentials, 'api/v1/projects/PROJECT_ID/users/USER_ID', {
          method: 'delete',
        });
    });
  });
});

describe('models.Project.static', function() {
  beforeEach(function() {
    spyOn(requestUtils, 'authenticatedRequest').and.returnValue(Promise.resolve('RESPONSE'));
    spyOn(Project, 'serializeList').and.returnValue('SERIALIZED');
    this.credentials = credentialsFactory();
  });

  describe('#listProjects', function() {
    beforeEach(function(done) {
      this.request = Project.listProjects(this.credentials)
        .then(response => { this.response = response; })
        .then(done, done.fail);
    });

    it('should fetch the projects', function() {
      expect(requestUtils.authenticatedRequest).toHaveBeenCalledWith(
        this.credentials, 'api/projects/');
    });

    it('should return the serialized projects', function() {
      expect(Project.serializeList).toHaveBeenCalledWith('RESPONSE');
      expect(this.response).toEqual('SERIALIZED');
    });
  });

  describe('#createProject', function() {
    beforeEach(function() {
      spyOn(Project, 'serialize').and.returnValue('SERIALIZED');
    });

    describe('when an app is provided', function() {
      beforeEach(function(done) {
        this.request = Project.createProject(this.credentials, 'NEW PROJECT NAME', {
          app: 'SOME-APP-NAME',
        })
          .then(response => { this.response = response; })
          .then(done, done.fail);
      });

      it('should use the app to create the project', function() {
        expect(requestUtils.authenticatedRequest)
          .toHaveBeenCalledWith(this.credentials, 'api/projects/', {
            method: 'post',
            query: {
              name: 'NEW PROJECT NAME',
              app: 'SOME-APP-NAME',
            },
          });
      });

      it('should serialize the response', function() {
        expect(Project.serialize).toHaveBeenCalledWith('RESPONSE');
        expect(this.response).toEqual('SERIALIZED');
      });
    });

    describe('when no app is provided', function() {
      beforeEach(function(done) {
        Project.createProject(this.credentials, 'NEW PROJECT NAME')
          .then(response => { this.response = response; })
          .then(done, done.fail);
      });

      it('should use the "blank" app to create the project', function() {
        expect(requestUtils.authenticatedRequest)
          .toHaveBeenCalledWith(this.credentials, 'api/projects/', {
            method: 'post',
            query: {
              name: 'NEW PROJECT NAME',
              app: 'blank',
            },
          });
      });

      it('should serialize the response', function() {
        expect(Project.serialize).toHaveBeenCalledWith('RESPONSE');
        expect(this.response).toEqual('SERIALIZED');
      });
    });
  });
});
