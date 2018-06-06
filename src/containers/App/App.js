import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Cell, Column, ColumnGroup, Table } from 'fixed-data-table';
import '../../../node_modules/fixed-data-table/dist/fixed-data-table.css';
import _ from 'lodash';
import './App.css';

// Change speed of throttle function
const throttleSpeed = 3000;

@connect(state => ({ rows: state.rows, cols: state.cols || new Array(10) }))
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: [],
      cols: new Array(10)
    };
  }

  onSnapshotReceived = data => {
    let rows = [];
    console.log('data or rows: ', data);
    data.forEach(row => {
      // if (this.state.rows.length) if it has length that implies it had something from before it turned off
      if (!this.state.rows.length) {
        rows[row.id] = [{}, row];
      } else {
        const rowsOnState = this.state.rows;
        const previousData = rowsOnState[row.id][1];
        rows[row.id] = [previousData, row];
      }
    });
    // const rows = this.state.rows.concat(data);
    const cols = Object.keys(rows[0][1]);
    this.setState({ rows, cols });
  }

  onUpdateReceived = (data) => {
    // const rows = this.state.rows.concat(data);
    let rows = this.state.rows;
    data.forEach(newRow => {
      const previousData = rows[newRow.id][1];
      rows[newRow.id] = [previousData, newRow];
    });

    this.setState({ rows });
  }

  throttleData = (delay, func) => {
    console.log('throttling data');
    let timer = 0;
    return function(data) {
      const now = new Date().getTime();
      if (now - timer < delay) {
        return;
      } else {
        timer = now;
        return func(data);
      }
    };
  };

  _cell = cellProps => {
    // old content
    const oldRowIndex = cellProps.rowIndex;
    const oldRowData = this.state.rows[oldRowIndex][0];
    const oldCol = this.state.cols[cellProps.columnKey];
    const oldContent = oldRowData[oldCol];
    // new content
    const rowIndex = cellProps.rowIndex;
    const rowData = this.state.rows[rowIndex][1];
    const col = this.state.cols[cellProps.columnKey];
    const content = rowData[col];
    // set class based on difference in values
    let cellClass = '';
    if (cellProps.columnKey !== 0) {
      if (content >= oldContent) {
        cellClass = 'cell-uptick';
      } else if (content < oldContent) {
        cellClass = 'cell-downtick';
      } else {
        cellClass = '';
      }
    }
    return <Cell className={cellClass}>{content}</Cell>;
  }

  _headerCell = cellProps => {
    const col = this.state.cols[cellProps.columnKey];
    return <Cell>{col}</Cell>;
  }

  _generateCols = () => {
    console.log('generating...cols');
    console.log('generating...rows');
    let cols = [];
    this.state.cols.forEach((row, index) => {
      cols.push(
        <Column
          width={100}
          flexGrow={1}
          cell={this._cell}
          header={this._headerCell}
          columnKey={index}
        />
      );
    });
    return cols;
  }

  componentDidMount() {
    if (socket) {
      socket.on('snapshot', this.onSnapshotReceived);
      socket.on('updates', this.throttleData(throttleSpeed, this.onUpdateReceived));
    }
  }

  componentWillUnmount() {
    if (socket) {
      socket.removeListener('snapshot', this.onSnapshotReceived);
      socket.removeListener(
        'updates',
        this.throttleData(throttleSpeed, this.onUpdateReceived)
      );
    }
  }

  render() {
    const columns = this._generateCols();
    return (
      <Table
        rowHeight={30}
        width={window.innerWidth}
        maxHeight={window.innerHeight}
        headerHeight={35}
        rowsCount={this.state.rows.length}
      >
        {columns}
      </Table>
    );
  }
}
