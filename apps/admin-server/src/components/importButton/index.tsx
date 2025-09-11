import React from 'react';
import {Button as RAButton} from '../ui/button';
import { processXlsFile } from './xls-extractor';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import validateFileData from './validate-file-data';
import ActionButtonsLine from './action-buttons-line';
import FileUpload from './file-upload';
import ImportNotifications from './import-notifications-line';
import ImportRowCount from './import-row-count-line.jsx';
import ImportDelimiter from './import-delimiter-line.jsx';
import countFailedImportRows from './countFailedImportRows';
import ImportUseIdCheckboxLine from './import-use-id-checkbox-line.jsx';

const ideaSchema = {
  title: 'string',
  summary: 'string',
  description: 'string',
};


export const ImportButton = ({ resource }: { resource: string }) => {
    if (!resource) throw new Error('emptyResource');

    const [open, setOpen] = React.useState(false);
    const [importing, setImporting] = React.useState(false);
    const [fileName, setFileName] = React.useState('');
    const [values, setValues] = React.useState([]);
    const [delimiter, setDelimiter] = React.useState('');
    const [useId, setUseId] = React.useState(true);
    const [dialogStatus, setDialogStatus] = React.useState('base');
    const [fileValidationNotifications, setFileValidationNotifications] = React.useState([]);

    const openImportDialog = () => {
        setOpen(true);
    };

    const clear = () => {
        setImporting(false);
        setFileName('');
        setValues([]);
        setFileValidationNotifications([]);
    };

    const handleClose = () => {
        clear();
        setOpen(false);
    };

    const handleImportDelimiterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDelimiter(e.target.value);
        clear();
    };

    const handleSubmit = (callback) => {
        setImporting(true);

        let apiValidationErrors = [];

        Promise.all(
        values.map((value) => callback(value).catch((error) => {
            var valueKeys = Object.keys(value);
            var formattedFirstValue  = valueKeys[0] && value[valueKeys[0]];
            var formattedSecondValue = valueKeys[1] && value[valueKeys[1]];
            // add first info rows for more information what row failed

            if(formattedFirstValue) {
            if(Array.isArray(value[valueKeys[0]]) || typeof value[valueKeys[0]] ==='string') {
                formattedFirstValue = `${valueKeys[0]} : ${value[valueKeys[0]].slice(0, 25)}` 
            } else {
                formattedFirstValue = `${valueKeys[0]}: ${value[valueKeys[0]]}`
            }
            } else {
            formattedFirstValue = '';
            }


            if(formattedSecondValue) {
            if(Array.isArray(value[valueKeys[1]]) || typeof value[valueKeys[1]] ==='string') {
                formattedSecondValue = `${valueKeys[1]} : ${value[valueKeys[1]].slice(0, 25)}` 
            } else {
                formattedSecondValue = `${valueKeys[1]}: ${value[valueKeys[1]]}`
            }
            } else {
            formattedSecondValue = '';
            }

            apiValidationErrors.push({
            messageType: 'apiValidationError',
            color: 'red',
            message: 'Failed to import row: ' + formattedFirstValue + '; ' + formattedSecondValue + ', because of error: ' +error.message,
            });
        })),
        ).then(() => {
        setFileValidationNotifications(apiValidationErrors);
        setImporting(false);
        setDialogStatus('importFinished');
        //   refresh();
        console.log("refresh");
        });
    };

    const prepareData = (value, addRemoveKeys) => {
        // certain columns should not be send, for instance date values, like createdAt and updatedAt
        // They are currently also present in export
        // some should probably, like deletedAt, should not be send by api
        const standardRemoveKeys = ['deletedAt', 'createdAt', 'updatedAt'];
        // certains keys should be parsed as object but exported as a JSON
        const exceptionsObjectKeys = ['location'];

        const removeKeys = addRemoveKeys ? standardRemoveKeys.concat(addRemoveKeys) : standardRemoveKeys;
        const arrayKeys = ['images'];

        const cleanUp = function (value, key, parentValues) {
        if (value && typeof value === 'object' && !exceptionsObjectKeys.includes(key)) {

            Object.keys(value).forEach(key => {
            // in case value is empty ont send it, many values will fail on empty string
            // for instance int types
            // this might cause issue when wanting to empty a field
            cleanUp(value[key], key, value)
            });
        } else {
            if (!value || removeKeys.includes(key)) {
            delete parentValues[key];
            }
        }
        }

        cleanUp(value, null)
        value['publishDate'] = new Date();
        return value;
    }

    const handleSubmitCreate = async () => {
        const callback = (value) => {
            // add Id key to remove
            value = prepareData(value, ['id']);
            value.tags = value.tags ? value.tags.split(",").map(name => name.trim()) : [];
            return fetch(`/api/openstad/api/project/${project}/resource`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(value),
            });
        };

        handleSubmit(callback);
    };

    const handleSubmitOverwrite = async () => {
        const callback = (value) => {
            value = prepareData(value);
            value.tags = value.tags ? value.tags.split(",").map(name => name.trim()) : [];
            return fetch(`/api/openstad/api/project/${project}/resource/${value.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(value),
            });
        }

        handleSubmit(callback);
    };

    const handleReload = async () => {
        clear();
        setDialogStatus('base');
    };

    const handleCheckBoxChange = async (e) => {
        setUseId(e.target.checked);
    };

    const onFileAdded = async (e) => {
        const { target } = e;

        const file = target.files && target.files[0];

        setFileName(file.name);

        let match = file.name.match(/\.(csv|tsv|xlsx?)$/);
        if (!match) throw new Error('File type not recognized')
        let ext = match[1];

        let values;
        if (ext =='csv' || ext == 'tsv') {
        values = await processCsvFile(file, { delimiter });
        } else {
        values = await processXlsFile(file, {});
        }
        
        setValues(values);
        setFileValidationNotifications(await validateFileData(values, ideaSchema));
        
        target.value = '';

    };

    const totalRows = values ? values.length : 0;

    return (
        <>
        <RAButton
            color='primary'
            component='span'
            variant={'text'}
            label={'import'}
            onClick={openImportDialog}
        >
        </RAButton>
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogTitle id='alert-dialog-title'>
            {'Import '} {resource}s
            </DialogTitle>
            <DialogContent>
            <div id='alert-dialog-description' style={{ fontFamily: 'sans-serif' }}>
                {dialogStatus === 'importFinished' ?
                <>
                    <h3>Import complete!</h3>
                    <p>
                    Imported <b>{totalRows - countFailedImportRows(fileValidationNotifications)}</b> from a total
                    of <b>{totalRows}</b> rows
                    </p>
                    <h5 style={{ color: 'red' }}>{countFailedImportRows(fileValidationNotifications)} failed rows:</h5>
                    <ImportNotifications {...{ fileValidationNotifications, dialogStatus }} />
                </>
                :
                <>
                    <p>Upload a csv, tsv or xls(x) file for bulk editing or creation. </p>
                    <ul>
                    <li>For creating: use a file without 'id' column.</li>
                    <li>For editing: use a file with 'id' column. (for instance export here, edit in excel and upload again)</li>
                    </ul>
                    <p style={{ margin: '0px' }}>{'Data file requirements'}</p>
                    <ol>
                    <li>{'Must be a \'.csv\', \'.tsv\' or \'.xls(x)\' file'}</li>
                    <li>{'Only columns corresponding to the data model will be imported, columns with user or aggregated data etc. will be ignored.'}</li>
                    <li>{'For setting a specific user to a row use a header named userId in your csv.'}</li>
                    </ol>
                    <ImportDelimiter {...{ delimiter, handleImportDelimiterChange }} />
                    <ImportUseIdCheckboxLine {...{ checked: useId, handleCheckBoxChange }}/>
                    <FileUpload  {...{ onFileAdded, clear, fileName }} />
                    <ImportNotifications {...{ fileValidationNotifications }} />
                    <ImportRowCount {...{ values }} />
                </>
                }
            </div>
            </DialogContent>
            <DialogFooter>
            <ActionButtonsLine {...{
                handleClose,
                handleSubmitCreate,
                handleSubmitOverwrite,
                handleReload,
                values,
                importing,
                dialogStatus,
                useId,
                idPresent: fileValidationNotifications.some(notification => notification['messageType'] === 'idColumnPresent'),
            }} />
            </DialogFooter>
        </Dialog>
        </>
    );

};
