import React from 'react';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';


const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default (props) => {
  const { delimiter, handleImportDelimiterChange } = props;
  const classes = useStyles();

  return (
    <div style={{ margin: '10px 0' }}>
      <FormControl className={classes.formControl}>
        <span htmlFor="demo-simple-select-label">Delimiter (csv/tsv only): </span>
      <br />
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        displayEmpty
        value={delimiter}
        onChange={handleImportDelimiterChange}
        inputProps={{
          name: 'age',
          id: 'age-native-helper',
        }}
      >
        <MenuItem value=""> Auto detect</MenuItem>
        <MenuItem value={','}>Comma (,)</MenuItem>
        <MenuItem value={';'}>Semicolon (;)</MenuItem>
      </Select>
      </FormControl>
    </div>);
}
