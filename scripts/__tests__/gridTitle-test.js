/** @jsx React.DOM */
jest.dontMock('../gridTitle.jsx');
jest.dontMock('../columnProperties.js');

var React = require('react/addons');
var GridTitle = require('../gridTitle.jsx');
var TestUtils = React.addons.TestUtils;
var ColumnProperties = require('../columnProperties.js');
var _ = require('underscore');

describe('GridTitle', function() {
	var title; 
	var columns; 
	var columnSettings; 
	var sortObject; 

	beforeEach(function(){
		columns = ["one", "two", "three"];
		columnSettings = new ColumnProperties(columns, [], "children", [], []);
    sortObject =  { 
        enableSort: true,
        changeSort: null, 
        sortColumn: "",
        sortAscending: true, 
        sortAscendingClassName: "", 
        sortDescendingClassName: "",
        sortAscendingComponent: null,
        sortDescendingComponent: null
    }

    title = TestUtils.renderIntoDocument(<GridTitle columns={columns} columnSettings={columnSettings} sortSettings={sortObject}/>);
	});

	it('calls method when clicked', function(){
		var node = TestUtils.findRenderedDOMComponentWithTag(title, 'thead');
		var headings = TestUtils.scryRenderedDOMComponentsWithTag(node, 'th');

		var mock = jest.genMockFunction(); 
		title.props.sortSettings.changeSort = mock;

		expect(headings.length).toEqual(3);

		var first = headings[0];
		expect(TestUtils.isDOMComponent(first)).toBe(true);
		expect(title.props.sortSettings.sortColumn).toEqual("");

		//todo: can we just get this from jsdom?
		var someEvent = {
			"target":{
				"dataset":{
					"title": "one"
				}
			}
		};
		React.addons.TestUtils.Simulate.click(first, someEvent);

    expect(mock.mock.calls.length).toEqual(1);
		expect(mock.mock.calls[0]).toEqual({0: 'one'});

	});

	it('doesnt sort column where sort is disabled', function(){
		var newMeta = [{
	    "columnName": "one",
	    "order": 2,
	    "locked": false,
	    "visible": true,
	    "displayName": "Name",
	    "sortable" : false
	  }];
		var columnSettings2 = new ColumnProperties(columns, [], "children", newMeta, []);

		var title2 = TestUtils.renderIntoDocument(<GridTitle columns={columns} columnSettings={columnSettings2} sortSettings={sortObject}/>);

		var node = TestUtils.findRenderedDOMComponentWithTag(title2, 'thead');
		var headings = TestUtils.scryRenderedDOMComponentsWithTag(node, 'th');

		var mock = jest.genMockFunction(); 
		title2.props.sortSettings.changeSort = mock;

		expect(headings.length).toEqual(3);

		var first = headings[0];
		var second = headings[1];

		expect(TestUtils.isDOMComponent(first)).toBe(true);
		expect(TestUtils.isDOMComponent(second)).toBe(true);
		expect(title2.props.sortSettings.sortColumn).toEqual("");

		//todo: can we just get this from jsdom?
		var someEvent = {
			"target":{
				"dataset":{
					"title": "one"
				}
			}
		};

		var otherEvent = {
			"target":{
				"dataset":{
					"title": "two"
				}
			}
		};
		React.addons.TestUtils.Simulate.click(first, someEvent);

    expect(mock.mock.calls.length).toEqual(0);

		React.addons.TestUtils.Simulate.click(second, otherEvent);	
		expect(mock.mock.calls.length).toEqual(1);
		expect(mock.mock.calls[0]).toEqual({0:"two"});
	});


	var getColumnSettings = function(columns, columnMetaData) {
		return new ColumnProperties(columns, [], "children", columnMetaData, [])
	};
	var getRenderedTitle = function(columns, columnMetaData) {
		return TestUtils.renderIntoDocument(<GridTitle columns={columns} columnSettings={getColumnSettings(columns, columnMetaData)} sortSettings={sortObject}/>);
	};
	var getColumns = function(columnMetaData) {
		return _.pluck(columnMetaData, "columnName");
	};
	var getHeaders = function(title) {
		return TestUtils.scryRenderedDOMComponentsWithTag(title, 'tr');
	};
	var getColumnGroupColSpans = function(columnGroups, columnMetaData) {
		return _.map(columnGroups, function(groupName){
			return _.filter(columnMetaData, function(columnMeta){
				return columnMeta.columnGroupName === groupName;
			}).length;
		});
	};

	it('should display column groups when configured', function() {
		var columnMetaData = [
			{
				columnName: "id",
				order: 1,
				visible: true,
				columnGroupName: "Name"
			},
			{
				columnName: "name",
				order: 2,
				visible: true,
				columnGroupName: "Name"
			},
			{
				columnName: "city",
				order: 3,
				visible: true,
				columnGroupName: "Address"
			},
			{
				columnName: "state",
				order: 4,
				visible: true,
				columnGroupName: "Address"
			}
		];
		var columns = getColumns(columnMetaData);
		var headers = getHeaders(getRenderedTitle(columns, columnMetaData));
		var columnGroups = _.uniq(_.pluck(columnMetaData, "columnGroupName"));
		var columnGroupColSpans = getColumnGroupColSpans(columnGroups, columnMetaData);

		var columnGroupHeaders = TestUtils.scryRenderedDOMComponentsWithTag(headers[0], 'th');
		expect(columnGroupHeaders.length).toEqual(columnGroups.length);

		TestUtils.scryRenderedDOMComponentsWithTag(headers[0], 'th').forEach(function(columnGroup, index){
			expect(columnGroup.props.children).toEqual(columnGroups[index]);
			expect(columnGroup.props.colSpan).toEqual(columnGroupColSpans[index]);
		});
		TestUtils.scryRenderedDOMComponentsWithTag(headers[1], 'th').forEach(function(column, index){
			expect(column.props.children[0]).toEqual(columns[index]);
		});
	});

	it('should display column names as column group names when column group names are not specified', function() {
		var columnMetaData = [
			{
				columnName: "id",
				order: 1,
				visible: true
			},
			{
				columnName: "name",
				order: 2,
				visible: true
			},
			{
				columnName: "city",
				order: 3,
				visible: true,
				columnGroupName: "Address"
			},
			{
				columnName: "state",
				order: 4,
				visible: true,
				columnGroupName: "Address"
			}
		];
		var columns = getColumns(columnMetaData);
		var headers = getHeaders(getRenderedTitle(columns, columnMetaData));
		var columnGroups = _.uniq(_.map(_.pluck(columnMetaData, "columnGroupName"), function(groupName, index){
			return groupName || columnMetaData[index].columnName;
		}));
		var columnGroupColSpans = getColumnGroupColSpans(columnGroups, columnMetaData);

		var columnGroupHeaders = TestUtils.scryRenderedDOMComponentsWithTag(headers[0], 'th');
		expect(columnGroupHeaders.length).toEqual(columnGroups.length);

		columnGroupHeaders.forEach(function(columnGroup, index){
			expect(columnGroup.props["data-title"] || columnGroup.props.children).toEqual(columnGroups[index]);
			if (columnGroupColSpans[index]) {
				expect(columnGroup.props.colSpan).toEqual(columnGroupColSpans[index]);
			}
		});
		TestUtils.scryRenderedDOMComponentsWithTag(headers[1], 'th').forEach(function(column, index){
			if (columnGroupColSpans[index]) {
				expect(column.props.children[0]).toEqual(columns[index]);
			}
		});
	});
});