import { serialize, serializeList } from '../../../src/serializers/project-serializer';
import projectFactory from './../../factories/project-response-factory';

describe('serializers.projectSerializer', function() {
  describe('#serialize', function() {
    it('should serialize a project', function() {
      const projectResponse = projectFactory(50, {
        name: 'PROJECT NAME',
        creator_id: 'CREATOR_ID',
        creator: 'CREATOR NAME',
        acl: 'owner',
        kind: 'full',
      });
      const serializedProject = serialize(projectResponse);

      expect(serializedProject.id).toEqual(50);
      expect(serializedProject.name).toEqual('PROJECT NAME');
      expect(serializedProject.creatorId).toEqual('CREATOR_ID');
      expect(serializedProject.creatorName).toEqual('CREATOR NAME');
      expect(serializedProject.timeCreated).toEqual(jasmine.any(Date));
      expect(serializedProject.timeUpdated).toEqual(jasmine.any(Date));
      expect(serializedProject.acl).toEqual('owner');
      expect(serializedProject.kind).toEqual('full');
    });
  });

  describe('#serializeList', function() {
    it('should serialize a list of projects', function() {
      const projectListResponse = [30, 5000].map(id => projectFactory(id));
      const serializedProjects = serializeList(projectListResponse);

      const entities = serializedProjects.entities;

      expect(entities.length).toEqual(2);
      expect(entities.map(entity => entity.id)).toContain(30, 5000);
      expect(entities[0]).toEqual(serialize(projectListResponse[0]));
      expect(entities[1]).toEqual(serialize(projectListResponse[1]));
    });
  });
});
