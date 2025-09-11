import React from 'react';
import Typography from '@material-ui/core/Typography';
import Zoom from '@material-ui/core/Zoom';
import LightTooltip from '../LightTooltip/index.jsx';
import InfoOutlined from '@material-ui/icons/InfoOutlined';

export default (props) => {
  const { fileValidationNotifications, dialogStatus } = props;

  if (dialogStatus === 'importFinished') {
    return (
      <React.Fragment>
        <Typography color="inherit">
          <ul>
          {
            fileValidationNotifications.map((validationError, index) => {
              return (
                <li
                  key={index}
                  style={{ color: validationError.color}}
                >
                    {`${validationError.message}`}
                  </li>
              );
            })
          }
          </ul>
        </Typography>
      </React.Fragment>);
  }

  if (!fileValidationNotifications || fileValidationNotifications.length < 1) {
    return <></>;
  }

  const color = fileValidationNotifications.filter(notification => notification['color'] === 'red').length > 0 ?
    'red' : 'blue';

  return (
    <div style={{ marginBottom: '0px', color }}>
      <span>
        {'Import validation alerts'}: <strong>{fileValidationNotifications.length}</strong>
      </span>
      <LightTooltip title={
        <React.Fragment>
          <Typography color="inherit">
          <ul>
            {
              fileValidationNotifications.map((validationError, index) => {
                return (
                  <li
                    key={index}
                    style={{ color: validationError.color, display: 'block' }}
                  >
                    {`${validationError.message}`}
                  </li>
                );
              })
            }
            </ul>
          </Typography>
        </React.Fragment>
      } TransitionComponent={Zoom} interactive arrow placement="top">
          <span
            style={{
              verticalAlign: 'middle',
              padding: '8px',
              cursor: 'pointer',
            }}
          >
          <InfoOutlined/>
          </span>
      </LightTooltip>
    </div>
  );
}
