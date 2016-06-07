var testState = require('../../support/test-state');

describe('DataTable', function() {
  beforeEach(function() {
    this.dataTableId = testState.getProjectId();
    this.dataTablePath = '/api/datatables/' + this.dataTableId;
  });

  describe('#fetchCapability', function() {
    it('should return the capability of the data table', function(done) {
      this.request(this.dataTablePath + '/capability')
        .expect(200)
        .expect(function(res) {
          expect(res.body).toContain('NOTIFICATION');
        })
        .end(this.endRequest(done));
    });
  });

  describe('#createCell', function() {
    it('should create a new cell', function(done) {
      var cellName = 'NEW-CELL-LABEL-' + this.randomString();

      this.request(this.dataTablePath + '/cells', 'post')
        .send({
          label: cellName,
          description: 'this is a cell!',
          value: JSON.stringify({ foo: 'bar' }),
        })
        .expect(200)
        .expect(function(res) {
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

          testState.setCellId(res.body.id);
        })
        .end(this.endRequest(done));
    });
  });

  describe('#listCells', function() {
    it('should list the cells in the data table', function(done) {
      this.request(this.dataTablePath + '/cells')
        .expect(200)
        .expect(function(res) {
          var cellIds = res.body.entities.map(function(cell) { return cell.id; });

          expect(cellIds).toContain(testState.getCellId());
        })
        .end(this.endRequest(done));
    });
  });

  describe('#fetchHistory', function() {
    it('should fetch the history of the cell', function(done) {
      // TODO(daishi): Add more extensive tests that do both reads and
      // writes, and the confrms that queries of such a history return the
      // expected results.
      this.request(this.dataTablePath + '/history')
        .expect(200)
        .expect(function(res) {
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
