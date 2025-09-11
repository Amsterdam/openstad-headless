import React from 'react';
import { Button } from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

export default (props) => {
  const { onFileAdded, clear, fileName } = props;

  return (<div>
    <Button variant='contained' component='label'>
      <span>Choose File</span>
      <GetAppIcon style={{ transform: 'rotate(180deg)', fontSize: '20' }}/>
      <input
        type='file'
        style={{ display: 'none' }}
        onChange={onFileAdded}
        accept='.csv,.tsv,.xls,.xlsx,.txt'
      />
    </Button>
    <span style={{
      verticalAlign: 'middle',
      paddingLeft: '8px',
    }}>{fileName}</span>
    <span
      style={{
        verticalAlign: 'middle',
        padding: '4px',
        cursor: fileName && fileName !== '' ? 'pointer' : 'not-allowed',
        color: fileName && fileName !== '' ? 'red' : 'grey',
      }}
      onClick={clear}
    >
      <DeleteForeverIcon/>
    </span>
  </div>);
}
