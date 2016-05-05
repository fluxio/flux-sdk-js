import {
  setProjectId,
  getProjectId,
} from '../../support/test-state';

describe('User', function() {
  describe('#fetchProfile', function() {
    it('should retrieve their profile', function(done) {
      this.request('/api/profile')
        .expect(200)
        .expect(res => {
          expect(Object.keys(res.body)).toContain(
            'id',
            'first_name',
            'last_name',
            'email',
            'makerid',
            'display_name',
            'kind',
            'cohort',
            'account_type',
            'external_user'
          );
        })
        .end(this.endRequest(done));
    });
  });

  describe('#createProject', function() {
    it('should create a new project', function(done) {
      this.request('/api/projects', 'post')
        .send({ name: `NEW PROJECT NAME-${this.randomString()}` })
        .expect(200)
        .expect(res => {
          expect(Object.keys(res.body)).toContain(
            'id',
            'name',
            'creatorId',
            'creatorName',
            'timeCreated',
            'timeUpdated',
            'disabled'
          );

          setProjectId(res.body.id);
        })
        .end(this.endRequest(done));
    });
  });

  describe('#listProjects', function() {
    it('should retrieve their projects', function(done) {
      this.request('/api/projects')
        .expect(200)
        .expect(res => {
          const projectIds = res.body.entities.map(project => project.id);

          expect(projectIds).toContain(getProjectId());
        })
        .end(this.endRequest(done));
    });
  });
});
