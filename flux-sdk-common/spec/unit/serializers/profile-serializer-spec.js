import serialize from '../../../src/serializers/profile-serializer';
import profileFactory from './../../factories/profile-response-factory';

describe('serializers.profileSerializer', function() {
  describe('#serialize', function() {
    it('should serialize the profile', function() {
      const profileResponse = profileFactory(1234, 'foo@example.com', 'First', 'Last');
      const serializedProfile = serialize(profileResponse);

      expect(serializedProfile.id).toEqual(1234);
      expect(serializedProfile.email).toEqual('foo@example.com');
      expect(serializedProfile.firstName).toEqual('First');
      expect(serializedProfile.lastName).toEqual('Last');
      expect(serializedProfile.displayName).toEqual('First Last');
      expect(serializedProfile.makerId).toEqual('foo@example.com');
      // profileFactory hard-codes kind to 'maker'.
      expect(serializedProfile.kind).toEqual('maker');
    });
  });
});
