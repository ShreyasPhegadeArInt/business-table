import { CoreRow, createRow, Row, Table } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';

import { ColumnEditorType } from '@/types';
import { setGlobalValue, setRIE, setRowInd } from '../GlobalRowOriginal';

/**
 * Use Editable Data
 */
export const useEditableData = <TData>({
  table,
  onUpdateRow,
}: {
  table: Table<TData>;
  onUpdateRow: (row: TData) => Promise<void>;
}) => {
  /**
   * Row
   */
  const [row, setRow] = useState<Row<TData> | null>(null);

  /**
   * Is Saving
   */
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Start Edit
   */
  const onStartEdit = useCallback(
    (row: Row<TData>) => {
      /**
       * Columns
       */

      // -------------------------------------- START: Setting Global Vars --------------------------------------------
      // HYPERPRINT
      console.log("AM SETTING...")
      // // PRINT SET
      // console.log("\n\nSetting Current Value of: ", getGlobalValue(), " --> EDITING");
      // console.log("Setting Current RIE: ", getRIE(), " --> ", row.original); 
      // console.log("Setting Current index: ", getRowInd(), " --> ", row.index); 

      // // ACTUAL SET
      setGlobalValue("EDITING");
      setRIE(JSON.stringify(row.original));
      // setOR(JSON.stringify(row));
      setRowInd(row.index);
      // ---------------------------------------- END: Setting Global Vars --------------------------------------------

      const columns = table.getAllColumns();

      /**
       * Update original row and replace initial value for text area editors
       */
      const updatedOriginalRow = Object.entries(row.original as CoreRow<TData>).reduce<{ [key: string]: unknown }>(
        (acc, [key, value]) => {
          const foundColumn = columns.find((obj) => obj.id === key);

          /**
           * Update text area value
           */
          if (
            foundColumn?.columnDef.meta?.editable &&
            foundColumn?.columnDef.meta?.editor?.type === ColumnEditorType.TEXTAREA
          ) {
            acc[key] = value.replaceAll('\n', '\\n');
          } else {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      /**
       * Set row with updated original row option
       */
      let tempRow = createRow(table, row.id, updatedOriginalRow as TData, row.index, row.depth)
      console.log("tempRow: ", tempRow);
      setRow(tempRow);
    },
    [table]
  );

  /**
   * Cancel Edit
   */
  const onCancelEdit = useCallback(() => {
    // -------------------------------------- START: Reset Global Vars --------------------------------------------
    console.log("CANCELLING...");
    // console.log("\n\nSetting Current Value of: ", getGlobalValue(), "  --> NOT_EDITING"); 
    // console.log("Setting Current RIE: ", getRIE(), " --> \"\""); 
    // console.log("Setting Current index: ", getRowInd(), " --> -1"); 
    setGlobalValue("NOT_EDITING");
    setRIE("");
    // setOR("");
    setRowInd(-1);
    // ---------------------------------------- END: Reset Global Vars --------------------------------------------

    setRow(null);
  }, []);

  /**
   * Change
   */
  const onChange = useCallback(
    (row: Row<TData>, event: { columnId: string; value: unknown }) => {
      const original = {
        ...row.original,
        [event.columnId]: event.value,
      };
      // console.log("\nonChange has been called\n");
      setRow(createRow(table, row.id, original, row.index, row.depth));
    },
    [table]
  );

  /**
   * Save
   */
  const onSave = useCallback(
    
    async (row: Row<TData>) => {
      // -------------------------------------- START: Reset Global Vars --------------------------------------------
      console.log("SAVING...");
      // console.log("\n\nSetting Current Value of: ", getGlobalValue(), "  --> NOT_EDITING");
      // console.log("Setting Current RIE: ", getRIE(), " --> \"\"");
      // console.log("Setting Current index: ", getRowInd(), " --> -1");
      setGlobalValue("NOT_EDITING");
      setRIE("");
      // setOR("");
      setRowInd(-1);
      // ---------------------------------------- END: Reset Global Vars --------------------------------------------

      setIsSaving(true);

      try {
        await onUpdateRow(row.original);

        setIsSaving(false);
        onCancelEdit();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setIsSaving(false);
      }
    },
    [onCancelEdit, onUpdateRow]
  );

  return useMemo(
    () => ({
      onStartEdit,
      row,
      onCancelEdit,
      onChange,
      onSave,
      isSaving,
    }),
    [onStartEdit, row, onCancelEdit, onChange, onSave, isSaving]
  );
};
