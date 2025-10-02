import React from 'react';
import { Button as RAButton } from '../ui/button';
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
import ImportRowCount from './import-row-count-line';
import countFailedImportRows from './countFailedImportRows';
import ImportUseIdCheckboxLine from './import-use-id-checkbox-line';
import { translateHeaders } from './translate-headers';

const ideaSchema = {
    title: 'string',
    summary: 'string',
    description: 'string',
};

interface ValidationError {
    messageType: 'apiValidationError' | string;
    color: string;
    message: string;
}

interface FileValidationNotification {
    messageType: string;
    color: string;
    message: string;
}

export const ImportButton = ({ project }: { project: string }) => {

    const [open, setOpen] = React.useState(false);
    const [importing, setImporting] = React.useState(false);
    const [fileName, setFileName] = React.useState('');
    const [values, setValues] = React.useState([]);
    const [useId, setUseId] = React.useState(true);
    const [dialogStatus, setDialogStatus] = React.useState('base');
    const [fileValidationNotifications, setFileValidationNotifications] = React.useState<FileValidationNotification[]>([]);

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
        window.location.reload();
    };

    const handleSubmit = (callback: (value: any) => Promise<any>) => {
        setImporting(true);

        const apiValidationErrors: ValidationError[] = [];

        Promise.all(
            values.map((value) =>
                callback(value).catch((error: any) => {
                    var valueKeys = Object.keys(value);
                    var formattedFirstValue: string = valueKeys[0] && value[valueKeys[0]];
                    var formattedSecondValue: string = valueKeys[1] && value[valueKeys[1]];

                    // add first info rows for more information what row failed


                    if (formattedFirstValue) {
                        if (Array.isArray(value[valueKeys[0]]) || typeof value[valueKeys[0]] === 'string') {
                            formattedFirstValue = `${valueKeys[0]} : ${String(value[valueKeys[0]]).slice(0, 25)}`;
                        } else {
                            formattedFirstValue = `${valueKeys[0]}: ${value[valueKeys[0]]}`;
                        }
                    } else {
                        formattedFirstValue = '';
                    }

                    if (formattedSecondValue) {
                        if (Array.isArray(value[valueKeys[1]]) || typeof value[valueKeys[1]] === 'string') {
                            formattedSecondValue = `${valueKeys[1]} : ${String(value[valueKeys[1]]).slice(0, 25)}`;
                        } else {
                            formattedSecondValue = `${valueKeys[1]}: ${value[valueKeys[1]]}`;
                        }
                    } else {
                        formattedSecondValue = '';
                    }

                    apiValidationErrors.push({
                        messageType: 'apiValidationError',
                        color: 'red',
                        message: 'Failed to import row: ' + formattedFirstValue + '; ' + formattedSecondValue + ', because of error: ' + error.message,
                    });
                })),
        ).then(() => {
            setFileValidationNotifications(apiValidationErrors);
            setImporting(false);
            setDialogStatus('importFinished');
        });
    };

    const prepareData = (value: Record<string, any>, addRemoveKeys?: string[]) => {
        // certain columns should not be sent, for instance date values, like createdAt and updatedAt
        const standardRemoveKeys = ['deletedAt', 'createdAt', 'updatedAt'];
        // certains keys should be parsed as object but exported as a JSON
        const exceptionsObjectKeys = ['location'];

        const removeKeys = addRemoveKeys ? standardRemoveKeys.concat(addRemoveKeys) : standardRemoveKeys;
        const arrayKeys = ['images'];

        const cleanUp = function (
        value: any,
        key: string,
        parentValues: Record<string, any> | null
        ) {
        if (value && typeof value === 'object' && !exceptionsObjectKeys.includes(key)) {
            Object.keys(value).forEach((childKey) => {
            cleanUp(value[childKey], childKey, value);
            });
        } else {
            if ((!value || removeKeys.includes(key)) && parentValues) {
            delete parentValues[key];
            }
        }
        };

        cleanUp(value, '', null)
        value['publishDate'] = new Date();
        return value;
    }

    const handleSubmitCreate = async () => {
        const callback = (value: any) => {
            // translate headers
            value = translateHeaders(value);
            // add Id key to remove
            value = prepareData(value, ['id']);
            value.tags = value.tags ? value.tags.split(",").map((name: string) => name.trim()) : [];

            return fetch(`/api/openstad/api/project/${project}/resource`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(value),
            });
        };

        handleSubmit(callback);
    };

    const handleSubmitOverwrite = async () => {
        const callback = (value: any) => {
            value = prepareData(value);
            value.tags = value.tags ? value.tags.split(",").map((name: string) => name.trim()) : [];
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

    const handleCheckBoxChange = (checked: boolean) => {
    setUseId(!!checked);
    };

const onFileAdded = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { target } = e;
        const file = target.files && target.files[0];
        if (!file) return;

        setFileName(file.name);

        let match = file.name.match(/\.(csv|tsv|xlsx?)$/);
        if (!match) throw new Error('File type not recognized')
        let ext = match[1];

        const values = await processXlsFile(file, {});

        setValues(values);
        setFileValidationNotifications(await validateFileData(values, ideaSchema));

        target.value = '';

    };

    const totalRows = values ? values.length : 0;

    return (
<>
  <RAButton
    className="text-xs p-2 w-fit"
    type="button"
    onClick={openImportDialog}
  >
    Importeer inzendingen
  </RAButton>

  <Dialog
    open={open}
    onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      setOpen(isOpen);
    }}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogContent>
      <DialogTitle id="alert-dialog-title">
        Importeer inzendingen
      </DialogTitle>

      <div
        id="alert-dialog-description"
        style={{ fontFamily: 'sans-serif'}}
      >
        {dialogStatus === 'importFinished' ? (
          <>
            <h3>Import complete!</h3>
            <p>
              Imported{' '}
              <b>
                {totalRows - countFailedImportRows(fileValidationNotifications)}
              </b>{' '}
              from a total of <b>{totalRows}</b> rows
            </p>
            <h5 style={{ color: 'red' }}>
              {countFailedImportRows(fileValidationNotifications)} failed rows:
            </h5>
            <ImportNotifications
              {...{ fileValidationNotifications, dialogStatus }}
            />
          </>
        ) : (
          <>
            <p style={{ marginBottom: '10px' }}>
              Upload an xls(x) file for bulk editing or creation.
            </p>
            <ul style={{ marginBottom: '10px' }} className="list-disc pl-5">
              <li>For creating: use a file without 'id' column.</li>
              <li >
                For editing: use a file with 'id' column. (for instance export
                here, edit in excel and upload again)
              </li>
            </ul>
            <p style={{ marginBottom: '5px' }}>Data file requirements</p>
            <ol className="list-decimal pl-5">
              <li>Must be an '.xls(x)' file</li>
              <li>
                Only columns corresponding to the data model will be imported,
                columns with user or aggregated data etc. will be ignored.
              </li>
              <li>
                For setting a specific user to a row use a header named userId in
                your csv.
              </li>
            </ol>
            <ImportUseIdCheckboxLine
              {...{ checked: useId, handleCheckBoxChange }}
            />
            <FileUpload {...{ onFileAdded, clear, fileName }} />
            <ImportNotifications {...{ fileValidationNotifications, dialogStatus }} />
            <ImportRowCount {...{ values }} />
          </>
        )}
      </div>

      <DialogFooter>
        <ActionButtonsLine
          {...{
            handleClose,
            handleSubmitCreate,
            handleSubmitOverwrite,
            handleReload,
            values,
            importing,
            dialogStatus,
            useId,
            idPresent: fileValidationNotifications.some(
              (n) => n.messageType === 'idColumnPresent'
            ),
          }}
        />
      </DialogFooter>
    </DialogContent>
  </Dialog>
</>

    );

};
