import {
  getProjectId,
  getCellId,
  setCellId,
} from '../../support/test-state';

describe('DataTable', function() {
  beforeEach(function() {
    this.dataTableId = getProjectId();
    this.dataTablePath = `/api/datatables/${this.dataTableId}`;
  });

  describe('#fetchCapability', function() {
    it('should return the capability of the data table', function(done) {
      this.request(`${this.dataTablePath}/capability`)
        .expect(200)
        .expect(res => {
          expect(res.body).toContain('NOTIFICATION');
        })
        .end(this.endRequest(done));
    });
  });

  describe('#createCell', function() {
    it('should create a new cell', function(done) {
      const cellName = `NEW-CELL-LABEL-${this.randomString()}`;

      this.request(`${this.dataTablePath}/cells`, 'post')
        .send({
          label: cellName,
          description: 'this is a cell!',
          value: JSON.stringify({ foo: 'bar' }),
        })
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

          setCellId(res.body.id);
        })
        .end(this.endRequest(done));
    });
  });

  describe('#listCells', function() {
    it('should list the cells in the data table', function(done) {
      this.request(`${this.dataTablePath}/cells`)
        .expect(200)
        .expect(res => {
          const cellIds = res.body.entities.map(cell => cell.id);

          expect(cellIds).toContain(getCellId());
        })
        .end(this.endRequest(done));
    });
  });

  describe('#fetchHistory', function() {
    it('should fetch the history of the cell', function(done) {
      // TODO(daishi): Add more extensive tests that do both reads and
      // writes, and the confrms that queries of such a history return the
      // expected results.
      this.request(`${this.dataTablePath}/history`)
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
  });
});
