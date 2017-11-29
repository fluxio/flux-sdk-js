const emptyPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
const smallPng = 'iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAB9klEQVRYR+2WwbVBMRCG51aACujk6oAOlMDO0tUBHSiBClCBElABtjbX+e85cUZeyJ/kvXcscpckk2/+fzKToq7rWr74KzJgojtZwUQBJStoK9jv96UoCtlut5S4lIKhQT+dDDh8iMlAUoAmaGzLrKpKlsulXK/XF3Ym3kdAZLnf71+CjsdjWSwWlD1mkUlQbyrLUna7nTdOMGC73ZbRaBQEaQCRHJTEx6iHdUEW44DVatUU+eVyeZu9XbPGCSRnbP4zQEaBXq8n5/NZdDlMJpMmudvtJqy9tIImOJSDAq1W60fBazlRo7gYPqW9BchajEBagdls1gAw7YS18l0sqgaZTF0NGb+9u6kmQW+isc+t1Obt6q2umNEKpjZvV2+E4t1uV06n09MQCtDVsE2E2BpzxcTlg+Wo92eTZyx2BUNPA5w9vth6Bch8Pvd2BEpBfShgD4eD3O93mU6n3tvsAjZw+M/XEaIAMZ9jRp49m31wdKO2VdCN+3g8NrDsx1obVIOuw4fDoWw2GxkMBrJer1m+Zrow1iYD4nJ0Op0nGPsMC21PwTWopdLjT79U9BoDrh+tvlmu9ycBmkAa1PbaBc5cjmSLmaKzwUOeWf8CyCThW/MrFvsOSfk/A6aoFz1JUg8N2Z8tDlHLtTYrmBVMVSB1/9fX4APhlZuYhrTc9gAAAABJRU5ErkJggg==';
const largePng = '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';

const testViewpoint = {
  perspectiveCamera: {
    cameraViewPoint: {
      x: 1.234,
      y: 4.567,
      z: 8.901,
    },
    cameraDirection: {
      x: 1.234,
      y: 4.567,
      z: 8.901,
    },
    cameraUpVector: {
      x: 1.234,
      y: 4.567,
      z: 8.901,
    },
    fieldOfView: 0.7,
  },
  fluxProperties: {
    context: 'off',
  },
  snapshot: {
    snapshotType: 'png',
    snapshotData: emptyPng,
  },
};

describe('Viewpoint', function() {
  beforeAll(function(done) {
    this.user.createProject('BCF VIEWPOINT TEST PROJECT')
    .then(({ transformed: { id } }) => {
      this.project = this.user.getProject(id);
      return this.project.createTopic({
        title: 'test viewpoints',
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
    describe('#createViewpoint', function() {
      it('should create a viewpoint', function(done) {
        this.topic.createViewpoint(testViewpoint)
        .then((viewpoint) => {
          expect(viewpoint.perspectiveCamera.cameraViewPoint.x)
          .toEqual(testViewpoint.perspectiveCamera.cameraViewPoint.x);
        })
        .then(done, done.fail);
      });
    });

    describe('#fetch', function() {
      it('should fetch the viewpoint', function(done) {
        this.topic.createViewpoint(testViewpoint)
        .then((viewpoint) => {
          return viewpoint.fetch();
        })
        .then((viewpoint) => {
          expect(viewpoint.perspectiveCamera.cameraViewPoint.x)
          .toEqual(testViewpoint.perspectiveCamera.cameraViewPoint.x);
        })
        .then(done, done.fail);
      });
    });

    describe('#getSnapshot', function() {
      it('should get the viewpoint\'s snapshot', function(done) {
        this.topic.createViewpoint(testViewpoint)
        .then((viewpoint) => {
          viewpoint.getSnapshot().then((snapshot) => {
            expect(snapshot).toContain('data:image/png;base64,');
          }).then(done, done.fail);
        });
      });
    });

    describe('#getSnapshotURL', function() {
      it('should return a url', function(done) {
        this.topic.createViewpoint(testViewpoint)
        .then((viewpoint) => {
          const url = viewpoint.getSnapshotURL();
          expect(url.length > 0).toBe(true);
          expect(url.slice(0, 4)).toEqual('http');
        })
        .then(done, done.fail);
      });
    });

    describe('#replaceSnapshot', function() {
      it('should update the viewpoint\'s snapshot', function(done) {
        this.topic.createViewpoint(testViewpoint)
        .then((viewpoint) => {
          return viewpoint.replaceSnapshot({
            snapshotType: 'png',
            snapshotData: smallPng,
          });
        })
        .then(done, done.fail);
      });

      it('should update the viewpoint\'s snapshot when the image is large', function(done) {
        this.topic.createViewpoint(testViewpoint)
        .then((viewpoint) => {
          return viewpoint.replaceSnapshot({
            snapshotType: 'png',
            snapshotData: largePng,
          });
        })
        .then(done, done.fail);
      });
    });

    describe('#getViewpoints', function() {
      it('should get a list of viewpoints', function(done) {
        this.topic.getViewpoints()
        .then((viewpoints) => {
          expect(viewpoints.length >= 0).toBe(true);
        })
        .then(done, done.fail);
      });
    });
  });
});
