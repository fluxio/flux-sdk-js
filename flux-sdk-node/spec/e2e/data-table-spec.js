const Cell = require('flux-sdk-common/lib/models/cell');

describe('DataTable', function() {
  beforeAll(function(done) {
    this.user.createProject('DATA TABLE TEST PROJECT')
      .then(({ transformed: { id } }) => {
        this.dataTableId = id;
        this.dataTable = this.user.getDataTable(id);
      })
      .then(done, done.fail);
  });

  afterAll(function(done) {
    this.user.getProject(this.dataTableId).delete().then(done, done.fail);
  });

  describe('#getCell', function() {
    beforeEach(function() {
      this.fakeCell = {};
      spyOn(Cell, 'default').and.returnValue(this.fakeCell);
    });

    it('should return a Cell', function() {
      const cell = this.dataTable.getCell('fake-cell-id');

      expect(cell).toBe(this.fakeCell);
      expect(Cell.default).toHaveBeenCalledWith(this.credentials, this.dataTableId, 'fake-cell-id');
    });
  });

  describe('#createCell', function() {
    beforeEach(function() {
      this.fakeCell = {};
      spyOn(Cell.default, 'createCell').and.returnValue(this.fakeCell);
    });

    it('should create a new cell', function() {
      const cell = this.dataTable.createCell('NEW CELL NAME', { description: 'test cell' });

      expect(cell).toBe(this.fakeCell);
      expect(Cell.default.createCell)
        .toHaveBeenCalledWith(this.credentials, this.dataTableId, 'NEW CELL NAME', {
          description: 'test cell',
        });
    });
  });

  describe('#listCells', function() {
    beforeEach(function() {
      this.fakeCells = {};
      spyOn(Cell.default, 'listCells').and.returnValue(this.fakeCells);
    });

    it('should list the cells for the data table', function() {
      const cells = this.dataTable.listCells();

      expect(cells).toBe(this.fakeCells);
      expect(Cell.default.listCells).toHaveBeenCalledWith(this.credentials, this.dataTableId);
    });
  });

  describe('#fetchHistory', function() {
    beforeAll(function(done) {
      this.dataTable.createCell('seed cell 1', { value: 'original value' })
        .then(({ transformed }) => {
          this.seedCell1 = transformed;

          return this.dataTable.getCell(this.seedCell1.id)
            .update({ value: 'new value' });
        })
        .then(() => {
          return this.dataTable.createCell('seed cell 2', { value: 10 });
        })
        .then(({ transformed }) => {
          this.seedCell2 = transformed;
        })
        .then(() => {
          return this.dataTable.createCell('seed cell 3');
        })
        .then(({ transformed }) => {
          this.seedCell3 = transformed;
        })
        .then(done, done.fail);
    });

    afterAll(function(done) {
      this.dataTable.getCell(this.seedCell1.id).delete()
        .then(() => {
          return this.dataTable.getCell(this.seedCell2.id).delete();
        })
        .then(() => {
          return this.dataTable.getCell(this.seedCell3.id).delete();
        })
        .then(done, done.fail);
    });

    describe('with no additional options', function() {
      beforeAll(function(done) {
        this.dataTable.fetchHistory()
          .then(({ original, transformed }) => {
            this.original = original;
            this.transformed = transformed;
          })
          .then(done, done.fail);
      });

      it('should receive the history for the full data table', function() {
        expect(this.original.errStr).toEqual('');
        expect(this.original.historyQuery).toEqual(null);

        expect(this.original.historyEvents).toEqual(jasmine.any(Array));

        // We can't guarantee the length because it depends on the test order.
        expect(this.original.historyEvents.length).toBeGreaterThan(3);

        this.original.historyEvents.forEach(event => {
          const cellEvent = event.Event;

          expect(cellEvent.Type).toEqual('CELL_MODIFIED');
          expect(cellEvent.CellId).toEqual(jasmine.any(String));
          expect(cellEvent.ClientInfo).toEqual(jasmine.any(Object));
          expect(cellEvent.Size).toEqual(jasmine.any(Number));
          expect(cellEvent.Time).toEqual(jasmine.any(Number));
          expect(cellEvent.ValueRef).toEqual(jasmine.any(String));
        });
      });
    });

    describe('when the cell IDs are restricted', function() {
      beforeAll(function(done) {
        this.dataTable.createCell('seed cell 4', { value: 'seed cell' })
          .then(({ transformed }) => {
            this.seedCell4 = transformed;
          })
          .then(() => (
            this.dataTable.fetchHistory({ cellIds: [this.seedCell3.id, this.seedCell4.id] })
          ))
          .then(({ original }) => {
            this.original = original;
          })
          .then(done, done.fail);
      });

      it('should only receive events for the specified IDs', function() {
        expect(this.original.historyEvents.length).toEqual(2);

        const cellIds = this.original.historyEvents.map(event => event.Event.CellId);

        expect(cellIds).toContain(this.seedCell3.id, this.seedCell4.id);
        expect(cellIds).not.toContain(this.seedCell1.id, this.seedCell2.id);
      });
    });

    describe('when the number of results is restricted', function() {
      beforeAll(function(done) {
        this.dataTable.fetchHistory({ limit: 2 })
          .then(({ original, transformed }) => {
            this.original = original;
            this.transformed = transformed;
          })
          .then(done, done.fail);
      });

      it('should paginate the results', function() {
        expect(this.original.historyQuery).toEqual({
          Limit: 2,
          Cursor: jasmine.any(String),
        });
      });
    });

    describe('when the times are restricted', function() {
      beforeAll(function(done) {
        this.dataTable.createCell('history cell', { value: 0 })
          .then(({ transformed }) => {
            this.startTime = transformed.timeUpdated.getTime() + 1;

            this.cell = this.dataTable.getCell(transformed.id);

            return this.cell;
          })
          .then(cell => new Promise(resolve => {
            // Adds 1ms to the time to help prevent race conditions
            setTimeout(() => resolve(cell.update({ value: 1 })), 1);
          }))
          .then(() => {
            return this.cell.update({ value: 2 });
          })
          .then(() => {
            return this.cell.update({ value: 3 });
          })
          .then(({ transformed }) => {
            this.endTime = transformed.timeUpdated.getTime() - 1;

            return this.dataTable.fetchHistory({
              startTime: this.startTime,
              endTime: this.endTime,
            });
          })
          .then(({ original, transformed }) => {
            this.original = original;
            this.transformed = transformed;
          })
          .then(done, done.fail);
      });

      afterAll(function(done) {
        this.cell.delete().then(done, done.fail);
      });

      it('should only receive the events from within the bounded times', function() {
        // We expect to receive only the events where the value gets updated to 1 and 2.
        expect(this.original.historyEvents.length).toEqual(2);

        this.original.historyEvents.forEach(event => {
          const time = event.Event.Time;

          expect(time).toBeGreaterThan(this.startTime);
          expect(time).toBeLessThan(this.endTime);
        });
      });
    });
  });
});
