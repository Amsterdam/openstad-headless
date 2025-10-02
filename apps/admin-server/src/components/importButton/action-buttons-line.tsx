import React from 'react';
import { Button } from '../ui/button';


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
      <Button 
        onClick={handleClose}
        variant='ghost'
      >
        <span>{'CLOSE'}</span>
      </Button>

        <Button
          onClick={handleReload}
          color='secondary'
          variant='default'
        >
          {/* {importing && <CircularProgress size={18} thickness={2}/>} */}
          <span>{'Import another'}</span>
        </Button>
      </>
    );
  }

  return (
    <>
      <Button 
        onClick={handleClose}
        variant='ghost'
      >
        <span>{'CLOSE'}</span>
      </Button>
      <Button
        disabled={(!values || values.length < 1) || importing}
        onClick={handleSubmitCreate}
        color='secondary'
        variant='default'
      >
        {/* {importing && <CircularProgress size={18} thickness={2}/>} */}
        <span>{'CREATE ROWS'}</span>
      </Button>
      <Button
        disabled={!values || values.length < 1 || importing || !idPresent || (idPresent && !useId)}
        onClick={handleSubmitOverwrite}
        color='primary'
        variant='default'
      >
        {/* {importing && <CircularProgress size={18} thickness={2}/>} */}
        <span>{'UPDATE ROWS'}</span>
      </Button>
    </>
  );
}
