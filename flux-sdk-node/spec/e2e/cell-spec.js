describe('Cell', function() {
  beforeAll(function(done) {
    this.user.createProject('CELL TEST PROJECT')
      .then(({ transformed: { id } }) => {
        this.dataTableId = id;
        this.project = this.user.getProject(id);
        this.dataTable = this.project.getDataTable(id);
      })
      .then(done, done.fail);
  });

  afterAll(function(done) {
    this.project.delete().then(done, done.fail);
  });

  describe('instance methods', function() {
    beforeAll(function(done) {
      this.originalLabel = 'ORIGINAL NAME';
      this.originalDescription = 'a test cell';
      this.originalValue = [10, 'something'];

      this.dataTable.createCell(this.originalLabel, {
        description: this.originalDescription,
        value: this.originalValue,
      })
        .then(({ transformed }) => {
          this.initialCell = transformed;
          this.cell = this.dataTable.getCell(transformed.id);
        })
        .then(done, done.fail);
    });

    afterAll(function(done) {
      this.cell.delete().then(done, done.fail);
    });

    describe('#fetch', function() {
      beforeAll(function(done) {
        this.cell.fetch()
          .then(({ original, transformed }) => {
            this.original = original;
            this.transformed = transformed;
          })
          .then(done, done.fail);
      });

      it('should receive a valid cell with a value', function() {
        const cell = this.original;
        const clientMetadata = cell.ClientMetadata;
        const metadata = cell.Metadata;
        const lastModification = metadata.Modify;
        const clientInfo = lastModification.ClientInfo;

        expect(cell.CellId).toEqual(jasmine.any(String));

        expect(clientMetadata.Label).toEqual('ORIGINAL NAME');
        expect(clientMetadata.Description).toEqual('a test cell');
        expect(clientMetadata.Locked).toEqual(false);

        expect(lastModification.Time).toEqual(jasmine.any(Number));
        expect(lastModification.Size).toEqual(16);

        expect(clientInfo.UserId).toEqual(this.userProfile.id);
        expect(clientInfo.UserName).toEqual(this.userProfile.displayName);
        expect(clientInfo.ClientId).toEqual(this.CLIENT_ID);
        expect(clientInfo.ClientName).toEqual(jasmine.any(String));

        expect(cell.value).toEqual([10, 'something']);
      });

      it('should transform the cell correctly', function() {
        const original = this.original;
        const clientMetadata = original.ClientMetadata;
        const lastModification = original.Metadata.Modify;
        const clientInfo = lastModification.ClientInfo;

        expect(this.transformed.id).toEqual(original.CellId);
        expect(this.transformed.label).toEqual(clientMetadata.Label);
        expect(this.transformed.description).toEqual(clientMetadata.Description);
        expect(this.transformed.size).toEqual(lastModification.Size);
        expect(this.transformed.timeUpdated).toEqual(new Date(lastModification.Time));
        expect(this.transformed.locked).toEqual(clientMetadata.Locked);
        expect(this.transformed.authorId).toEqual(clientInfo.UserId);
        expect(this.transformed.authorName).toEqual(clientInfo.UserName);
        expect(this.transformed.clientId).toEqual(clientInfo.ClientId);
        expect(this.transformed.clientName).toEqual(clientInfo.ClientName);
        expect(this.transformed.value).toEqual(original.value);
      });
    });

    describe('#update', function() {
      describe('when the cell is unlocked', function() {
        describe('when the label is updated', function() {
          beforeAll(function(done) {
            this.cell.update({ label: 'new label' })
              .then(({ transformed }) => {
                this.transformed = transformed;
              })
              .then(done, done.fail);
          });

          afterAll(function(done) {
            this.cell.update({ label: this.originalLabel }).then(done, done.fail);
          });

          it('should change only the label', function(done) {
            // Must use fetch in order to check the value
            this.cell.fetch()
              .then(({ transformed }) => {
                expect(transformed.label).toEqual('new label');

                expect(transformed.description).toEqual(this.originalDescription);
                expect(transformed.value).toEqual(this.originalValue);
              })
              .then(done, done.fail);
          });

          it('should transform the updated cell', function() {
            expect(this.transformed.id).toEqual(this.initialCell.id);
            expect(this.transformed.label).toEqual('new label');
            expect(this.transformed.description).toEqual(this.originalDescription);
          });
        });

        describe('when the description is updated', function() {
          beforeAll(function(done) {
            this.cell.update({ description: 'new description' })
              .then(({ transformed }) => {
                this.transformed = transformed;
              })
              .then(done, done.fail);
          });

          afterAll(function(done) {
            this.cell.update({ description: this.originalDescription }).then(done, done.fail);
          });

          it('should change only the description', function(done) {
            this.cell.fetch()
              .then(({ transformed }) => {
                expect(transformed.description).toEqual('new description');

                expect(transformed.label).toEqual(this.originalLabel);
                expect(transformed.value).toEqual(this.originalValue);
              })
              .then(done, done.fail);
          });
        });

        describe('when the cell gets locked', function() {
          beforeAll(function(done) {
            this.cell.update({ locked: true })
              .then(({ transformed }) => {
                this.transformed = transformed;
              })
              .then(done, done.fail);
          });

          afterAll(function(done) {
            this.cell.update({ locked: false }).then(done, done.fail);
          });

          it('should lock the cell', function(done) {
            this.cell.fetch()
              .then(({ transformed }) => {
                expect(transformed.locked).toEqual(true);

                expect(transformed.label).toEqual(this.originalLabel);
                expect(transformed.description).toEqual(this.originalDescription);
                expect(transformed.value).toEqual(this.originalValue);
              })
              .then(done, done.fail);
          });
        });
      });

      describe('when the cell is locked', function() {
        beforeAll(function(done) {
          this.cell.update({ locked: true }).then(done, done.fail);
        });

        afterAll(function(done) {
          this.cell.update({ locked: false }).then(done, done.fail);
        });

        describe('when the label and description are updated', function() {
          beforeAll(function(done) {
            this.cell.update({ label: 'new label', description: 'new description' })
              .then(({ transformed }) => {
                this.transformed = transformed;
              })
              .then(done, done.fail);
          });

          afterAll(function(done) {
            this.cell.update({ label: this.originalLabel, description: this.originalDescription })
              .then(done, done.fail);
          });

          it('should succeed', function() {
            expect(this.transformed.label).toEqual('new label');
            expect(this.transformed.description).toEqual('new description');
            expect(this.transformed.locked).toEqual(true);
          });
        });

        describe('when the value is updated', function() {
          it('should fail', function(done) {
            this.cell.update({ value: 'new value' })
              .then(done.fail)
              .catch(err => {
                expect(err.status).toEqual(403);

                done();
              });
          });
        });
      });
    });

    describe('#delete', function() {
      beforeAll(function(done) {
        this.dataTable.createCell('cell to be deleted')
          .then(({ transformed }) => {
            this.deleteCell = this.dataTable.getCell(transformed.id);
          })
          .then(done, done.fail);
      });

      it('should delete the cell', function(done) {
        this.deleteCell.delete()
          .catch(done.fail)
          .then(this.deleteCell.fetch)
          .then(done.fail)
          .catch(err => {
            expect(err.status).toEqual(500);

            done();
          });
      });
    });

    describe('#fetchHistory', function() {
      beforeAll(function(done) {
        this.dataTable.createCell('another cell')
          .then(({ transformed: { id } }) => {
            this.extraCell = this.dataTable.getCell(id);

            return this.cell.fetchHistory();
          })
          .then(({ transformed }) => {
            this.history = transformed;
          })
          .then(done, done.fail);
      });

      afterAll(function(done) {
        this.extraCell.delete().then(done, done.fail);
      });

      it('should only retrieve the history for the correct cell', function() {
        this.history.entities.forEach(event => {
          expect(event.cellId).toEqual(this.initialCell.id);
        });
      });
    });
  });

  describe('static methods', function() {
    describe('#createCell', function() {
      describe('when a value is provided', function() {
        beforeAll(function(done) {
          this.sdk.Cell.createCell(this.credentials, this.dataTableId, 'new cell', {
            value: 'something',
          })
            .then(({ transformed, original }) => {
              this.transformed = transformed;
              this.original = original;
              this.cell = this.dataTable.getCell(this.transformed.id);
            })
            .then(done, done.fail);
        });

        afterAll(function(done) {
          this.cell.delete().then(done, done.fail);
        });

        it('should return a valid cell without its value', function() {
          const cell = this.original;
          const clientMetadata = cell.ClientMetadata;
          const metadata = cell.Metadata;
          const lastModification = metadata.Modify;
          const clientInfo = lastModification.ClientInfo;

          expect(cell.CellId).toEqual(jasmine.any(String));

          expect(clientMetadata.Label).toEqual('new cell');
          expect(clientMetadata.Description).toEqual('');
          expect(clientMetadata.Locked).toEqual(false);

          expect(lastModification.Time).toEqual(jasmine.any(Number));
          expect(lastModification.Size).toEqual(11);

          expect(clientInfo.UserId).toEqual(this.userProfile.id);
          expect(clientInfo.UserName).toEqual(this.userProfile.displayName);
          expect(clientInfo.ClientId).toEqual(this.CLIENT_ID);
          expect(clientInfo.ClientName).toEqual(jasmine.any(String));

          expect(cell.value).toEqual(undefined);
        });

        it('should have set the value correctly', function(done) {
          this.cell.fetch()
            .then(({ original, transformed }) => {
              expect(original.value).toEqual('something');
              expect(transformed.value).toEqual('something');
            })
            .then(done, done.fail);
        });

        it('should transform the cell correctly', function() {
          const original = this.original;
          const clientMetadata = original.ClientMetadata;
          const lastModification = original.Metadata.Modify;
          const clientInfo = lastModification.ClientInfo;

          expect(this.transformed.id).toEqual(original.CellId);
          expect(this.transformed.label).toEqual(clientMetadata.Label);
          expect(this.transformed.description).toEqual(clientMetadata.Description);
          expect(this.transformed.size).toEqual(lastModification.Size);
          expect(this.transformed.timeUpdated).toEqual(new Date(lastModification.Time));
          expect(this.transformed.locked).toEqual(clientMetadata.Locked);
          expect(this.transformed.authorId).toEqual(clientInfo.UserId);
          expect(this.transformed.authorName).toEqual(clientInfo.UserName);
          expect(this.transformed.clientId).toEqual(clientInfo.ClientId);
          expect(this.transformed.clientName).toEqual(clientInfo.ClientName);
          expect(this.transformed.value).toEqual(undefined);
        });
      });

      describe('when a value is not provided', function() {
        beforeAll(function(done) {
          this.sdk.Cell.createCell(this.credentials, this.dataTableId, 'valueless cell')
            .then(({ transformed }) => {
              this.transformed = transformed;
              this.cell = this.dataTable.getCell(this.transformed.id);
            })
            .then(done, done.fail);
        });

        afterAll(function(done) {
          this.cell.delete().then(done, done.fail);
        });

        it('should create the cell successfully', function() {
          expect(this.transformed.id).toEqual(jasmine.any(String));
          expect(this.transformed.label).toEqual('valueless cell');
        });

        it('should give the cell a value of `null`', function(done) {
          this.cell.fetch()
            .then(({ original, transformed }) => {
              expect(original.value).toEqual(null);
              expect(transformed.value).toEqual(null);
            })
            .then(done, done.fail);
        });
      });
    });

    describe('#listCells', function() {
      beforeAll(function(done) {
        this.dataTable.createCell('seed cell 1')
          .then(res => {
            this.seedCell1 = res;

            return this.dataTable.createCell('seed cell 2');
          })
          .then(res => {
            this.seedCell2 = res;

            return this.sdk.Cell.listCells(this.credentials, this.dataTableId);
          })
          .then(({ transformed, original }) => {
            this.transformed = transformed;
            this.original = original;
          })
          .then(done, done.fail);
      });

      afterAll(function(done) {
        this.dataTable.getCell(this.seedCell1.transformed.id).delete()
          .then(() => {
            return this.dataTable.getCell(this.seedCell2.transformed.id).delete();
          })
          .then(done, done.fail);
      });

      it('should receive the list of cells', function() {
        expect(this.original.length).toEqual(2);

        expect(this.original).toContain(this.seedCell1.original, this.seedCell2.original);
      });

      it('should transform the cells correctly', function() {
        expect(this.transformed.entities.length).toEqual(this.original.length);

        expect(this.transformed.entities)
          .toContain(this.seedCell1.transformed, this.seedCell2.transformed);
      });
    });
  });
});
