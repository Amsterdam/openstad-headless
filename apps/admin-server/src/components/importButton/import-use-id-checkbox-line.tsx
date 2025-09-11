import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

export default (props) => {
  const { checked, handleCheckBoxChange } = props;

  return (
    <div style={{ margin: '10px 0' }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={!!checked}
            onChange={handleCheckBoxChange}
            name="useId"
            color="primary"
          />
        }
        label="Use ID for import"
      />
    </div>);
}
