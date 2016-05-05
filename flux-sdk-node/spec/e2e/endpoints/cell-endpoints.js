import {
  getProjectId,
  getCellId,
  setCellId,
} from '../../support/test-state';

describe('DataTable', function() {
  beforeEach(function() {
    this.dataTableId = getProjectId();
    this.cellId = getCellId();
    this.cellPath = `/api/datatables/${this.dataTableId}/cells/${this.cellId}`;
  });

  describe('#fetch', function() {
    it("should fetch the cell's data", function(done) {
      this.request(this.cellPath)
        .expect(200)
        .expect(res => {
          expect(Object.keys(res.body)).toContain(
            'id',
            'label',
            'description',
            'size',
            'timeUpdated',
            'locked',
            'authorId',
            'authorName',
            'clientId',
            'clientName'
          );
        })
        .end(this.endRequest(done));
    });
  });

  describe('#update', function() {
    describe('it should update the cell', function(done) {
      this.request(this.cellPath, 'post')
        .send({ label: 'NEW LABEL' })
        .expect(200)
        .expect(res => {
          expect(res.body.label).toEqual('NEW LABEL');
        })
        .end(this.endRequest(done));
    });
  });

  describe('#fetchHistory', function() {
    it('should fetch the history of the cell', function(done) {
      this.request(`${this.cellPath}/history`)
        .expect(200)
        .expect(res => {
          expect(Object.keys(res.body)).toContain(
            'entities',
            'page',
            'limit'
          );
        })
        .end(this.endRequest(done));
    });

    describe('#delete', function() {
      it('should delete the cell', function(done) {
        this.request(this.cellPath, 'delete')
          .expect(202)
          .expect(() => {
            setCellId(null);
          })
          .end(this.endRequest(done));
      });
    });
  });
});
