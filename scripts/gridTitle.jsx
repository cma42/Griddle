/*
   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
*/
var React = require('react');
var _ = require('underscore');
var ColumnProperties = require('./columnProperties.js');

var GridTitle = React.createClass({
  getDefaultProps: function(){
      return {
         "columnSettings" : null,
         "rowSettings" : null,
         "sortSettings": null,
         "multipleSelectionSettings": null,
         "headerStyle": null,
         "useGriddleStyles": true,
         "useGriddleIcons": true,
         "headerStyles": {},
      }
  },
  componentWillMount: function(){
    this.verifyProps();
  },
  sort: function(event){
      this.props.sortSettings.changeSort(event.target.dataset.title||event.target.parentElement.dataset.title);
  },
  toggleSelectAll: function (event) {
		this.props.multipleSelectionSettings.toggleSelectAll();
	},
  handleSelectionChange: function(event){
    //hack to get around warning message that's not helpful in this case
    return;
  },
  verifyProps: function(){
    if(this.props.columnSettings === null){
       console.error("gridTitle: The columnSettings prop is null and it shouldn't be");
    }

    if(this.props.sortSettings === null){
        console.error("gridTitle: The sortSettings prop is null and it shouldn't be");
    }
  },
  render: function(){
    this.verifyProps();
    var that = this;
    var columnGroups = [];
    var hasColumnGroups = _.some(this.props.columnSettings.columnMetadata, function (col){
        return col.columnGroupName && _.contains(this.props.columnSettings.getColumns(), col.columnName);
    }.bind(this));
    var titleStyles = null;

    var nodes = this.props.columnSettings.getColumns().map(function(col, index){
      var columnSort = "";
      var sortComponent = null;

      if(that.props.sortSettings.sortColumn == col && that.props.sortSettings.sortAscending){
          columnSort = that.props.sortSettings.sortAscendingClassName;
          sortComponent = that.props.useGriddleIcons && that.props.sortSettings.sortAscendingComponent;
      }  else if (that.props.sortSettings.sortColumn == col && that.props.sortSettings.sortAscending === false){
          columnSort += that.props.sortSettings.sortDescendingClassName;
          sortComponent = that.props.useGriddleIcons && that.props.sortSettings.sortDescendingComponent;
      }


      var meta = that.props.columnSettings.getColumnMetadataByName(col);
      var columnIsSortable = that.props.columnSettings.getMetadataColumnProperty(col, "sortable", true);
      var displayName = that.props.columnSettings.getMetadataColumnProperty(col, "displayName", col);

      columnSort = meta == null ? columnSort : (columnSort && (columnSort + " ")||columnSort) + that.props.columnSettings.getMetadataColumnProperty(col, "cssClassName", "");

      if (that.props.useGriddleStyles){
        titleStyles = {
          backgroundColor: "#EDEDEF",
          border: "0",
          borderBottom: "1px solid #DDD",
          color: "#222",
          padding: "5px",
          cursor: columnIsSortable ? "pointer" : "default"
        }
      }

      if (hasColumnGroups) {
          var columnGroupName = that.props.columnSettings.getMetadataColumnProperty(col, "columnGroupName");
          if (columnGroupName) {
              columnGroups.push({name: columnGroupName, node: null});
          } else {
              columnGroups.push({name: displayName, node: <th onClick={columnIsSortable ? that.sort : null} data-title={col} className={columnSort} key={col} style={titleStyles}>{displayName}{sortComponent}</th>});
              return (<th style={titleStyles}></th>);
          }
      }

      return (<th onClick={columnIsSortable ? that.sort : null} data-title={col} className={columnSort} key={col} style={titleStyles}>{displayName}{sortComponent}</th>);
    });

    if(nodes && this.props.multipleSelectionSettings.isMultipleSelection) {
      nodes.unshift(<th key="selection" onClick={this.toggleSelectAll} style={titleStyles}><input type="checkbox" checked={this.props.multipleSelectionSettings.getIsSelectAllChecked()} onChange={this.handleSelectionChange} /></th>);
    }

    //Get the row from the row settings.
    var className = that.props.rowSettings&&that.props.rowSettings.getHeaderRowMetadataClass() || null;

    var headerGroupNodes = _.map(_.groupBy(columnGroups, function(group) {
        return group.name;
    }), function(columns, columnGroup) {
        if (columns.length > 0) {
            if (columns[0].node) {
                return columns[0].node;
            } else {
              return (<th colSpan={columns.length} style={titleStyles}>{columnGroup}</th>);
            }
        }
    });

    var headerGroup = hasColumnGroups ? <tr>{headerGroupNodes}</tr> : "";

    return(
        <thead>
            {headerGroup}
            <tr
                className={className}
                style={this.props.headerStyles}>
                {nodes}
            </tr>
        </thead>
    );
  }

});

module.exports = GridTitle;
