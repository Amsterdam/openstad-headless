import React from 'react';
import { Select } from '../ui/select';

interface ImportDelimiterProps {
  delimiter: string;
  handleImportDelimiterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const ImportDelimiter: React.FC<ImportDelimiterProps> = ({ delimiter, handleImportDelimiterChange }) => {
  return (
    <div style={{ margin: '10px 0' }}>
      <label htmlFor="delimiter-select">Delimiter (csv/tsv only): </label>
      <br />
      <Select
        id="delimiter-select"
        value={delimiter}
        onChange={handleImportDelimiterChange}
      >
        <option value="">Auto detect</option>
        <option value=",">Comma (,)</option>
        <option value=";">Semicolon (;)</option>
      </Select>
    </div>
  );
};

export default ImportDelimiter;
