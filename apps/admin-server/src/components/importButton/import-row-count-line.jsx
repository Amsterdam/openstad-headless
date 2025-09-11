import React from 'react';
import Typography from '@material-ui/core/Typography';
import Zoom from '@material-ui/core/Zoom';
import LightTooltip from '../LightTooltip/index.jsx';
import InfoOutlined from '@material-ui/icons/InfoOutlined';

export default (props) => {
  const { values } = props;

  if (!values || values < 1) {
    return <></>;
  }

  return (
    <div style={{ marginBottom: '0px', color: 'blue' }}>
      <span>
        {'Import row count'}: <strong>{values.length}</strong>
      </span>
      <LightTooltip title={
        <React.Fragment>
          <Typography color="inherit">
            {
              values.map((row, rIndex) => {
                return (<span key={rIndex} style={{ color: 'black', display: 'block' }}>
                  {Object.keys(row).map((key, cIndex) => {
                    return (<span key={cIndex}>{`${row[key]}`}</span>);
                  })}
                  <hr/>
                </span>);
              })
            }
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
