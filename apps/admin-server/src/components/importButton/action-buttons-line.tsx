import React from 'react';
import {
  Button,
  CircularProgress,
} from '@material-ui/core';

export default (props) => {
  const {
    handleClose,
    handleSubmitCreate,
    handleSubmitOverwrite,
    handleReload,
    values,
    importing,
    useId,
    idPresent,
    dialogStatus,
  } = props;

  if (dialogStatus === 'importFinished') {
    return (
      <>
        <Button onClick={handleClose}>
          <span>{'close'}</span>
        </Button>

        <Button
          onClick={handleReload}
          color='secondary'
          variant='contained'
        >
          {importing && <CircularProgress size={18} thickness={2}/>}
          <span>{'Import another'}</span>
        </Button>
      </>
    );
  }

  return (
    <>
      <Button onClick={handleClose}>
        <span>{'close'}</span>
      </Button>
      <Button
        disabled={(!values || values.length < 1) || importing}
        onClick={handleSubmitCreate}
        color='secondary'
        variant='contained'
      >
        {importing && <CircularProgress size={18} thickness={2}/>}
        <span>{'Create rows'}</span>
      </Button>
      <Button
        disabled={!values || values.length < 1 || importing || !idPresent || (idPresent && !useId)}
        onClick={handleSubmitOverwrite}
        color='primary'
        variant='contained'
      >
        {importing && <CircularProgress size={18} thickness={2}/>}
        <span>{'Update rows'}</span>
      </Button>
    </>
  );
}
