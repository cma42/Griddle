jest.dontMock('../gridTable.jsx');
jest.dontMock('../gridRow.jsx');
jest.dontMock('../gridRowContainer.jsx');
jest.dontMock('../columnProperties.js');
jest.dontMock('../rowProperties.js');

var React = require('react/addons');
var GridTable = require('../gridTable.jsx');
var GridRow = require('../gridRow.jsx');
var GridRowContainer = require('../gridRowContainer.jsx');
var ColumnProperties = require('../columnProperties.js');
var RowProperties = require('../rowProperties.js');
var _ = require('underscore');

var TestUtils = React.addons.TestUtils;

describe('GridTable', function() {
    var data =  [
        {
            id: 0,
            name: "Mayer Leonard",
            city: "Kapowsin",
            state: "Hawaii",
            country: "United Kingdom"
        },
        {
            id: 1,
            name: "Koch Becker",
            city: "Johnsonburg",
            state: "New Jersey",
            country: "Madagascar"
        },
        {
            id: 2,
            name: "Lowery Hopkins",
            city: "Blanco",
            state: "Arizona",
            country: "Ukraine"
        }];
    var contentFooter = {
        data: {
            id: "TOTAL",
            state: 55,
            country: "Test Country"
        },
        useFixed: false
    };
    var columns = _.keys(data[0]);
    var columnSettings = new ColumnProperties(columns, [], "children", [], []);
    var rowSettings = new RowProperties({key: "id"}, GridRow, false);

    it('should display a footer row below all the grid data', function(){
        var table = TestUtils.renderIntoDocument(<GridTable columnSettings={columnSettings}
            rowSettings={rowSettings}
            data={data}
            contentFooter={contentFooter} />);

        var contentFooterCells = TestUtils.scryRenderedDOMComponentsWithTag(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tbody')[1], 'td');
        expect(contentFooterCells.length).toEqual(columns.length);
        contentFooterCells.forEach(function(cell, index){
            expect(cell.props.children[1]).toEqual(contentFooter.data[columns[index]]);
        });
    });
});
