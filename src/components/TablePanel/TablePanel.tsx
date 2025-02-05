import { PanelProps } from '@grafana/data';
import { config } from '@grafana/runtime';
import { Button, ToolbarButton, ToolbarButtonRow, useStyles2 } from '@grafana/ui';
import { Table as TableInstance } from '@tanstack/react-table';
import { AlertWithDetails } from '@volkovlabs/components';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { TEST_IDS } from '@/constants';
import {
  tablePanelContext,
  useContentSizes,
  useExportData,
  usePagination,
  useSavedState,
  useTable,
  useUpdateRow,
} from '@/hooks';
import { PanelOptions } from '@/types';
import { checkIfOperationEnabled } from '@/utils';

import { Table } from '../Table';
import { getStyles } from './TablePanel.styles';

/**
 * Properties
 */
type Props = PanelProps<PanelOptions>;

/**
 * Table Panel
 */
export const TablePanel: React.FC<Props> = ({
  id,
  data,
  width,
  height,
  options,
  eventBus,
  replaceVariables,
  title,
}) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);
  const [error, setError] = useState('');

  /**
   * Current group
   */
  const [currentGroup, setCurrentGroup] = useSavedState<string>({
    key: `volkovlabs.table.panel.${id}`,
    initialValue: options.tables?.[0]?.name || '',
  });

  /**
   * Current Table
   */
  const currentTable = useMemo(() => {
    if (options.tables?.length && currentGroup) {
      return options.tables.find((group) => group.name === currentGroup);
    }
    return;
  }, [options.tables, currentGroup]);

  /**
   * Is Add Row Enabled
   */
  const isAddRowEnabled = useMemo(() => {
    if (!currentTable) {
      return false;
    }

    return checkIfOperationEnabled(currentTable.addRow, {
      series: data.series,
      user: config.bootData.user,
    });
  }, [currentTable, data.series]);

  /**
   * Is Delete Row Enabled
   */
  const isDeleteRowEnabled = useMemo(() => {
    if (!currentTable) {
      return false;
    }

    return checkIfOperationEnabled(currentTable.deleteRow, {
      series: data.series,
      user: config.bootData.user,
    });
  }, [currentTable, data.series]);

  /**
   * Table
   */
  const { tableData, columns } = useTable({
    data,
    columns: currentTable?.items,
    isAddRowEnabled,
    isDeleteRowEnabled,
    replaceVariables,
    objects: options.nestedObjects,
  });

  /**
   * Table Instance
   */
  const tableInstance = useRef<TableInstance<(typeof tableData)[0]>>(null);

  /**
   * Pagination
   */
  const pagination = usePagination({
    paginationConfig: currentTable?.pagination,
    eventBus,
    data: data.series,
  });
  /**
   * Change current group if was removed
   */
  useEffect(() => {
    if (!options.tables?.some((group) => group.name === currentGroup)) {
      setCurrentGroup(options.tables?.[0]?.name || '');
    }
  }, [currentGroup, id, options.tables, setCurrentGroup]);

  /**
   * Show selected group first
   */
  const sortedGroups = useMemo(() => {
    if (!options.tables) {
      return [];
    }

    const activeGroup = options.tables.find((group) => group.name === currentGroup);

    /**
     * Selected group is not found
     */
    if (!activeGroup || !options.tabsSorting) {
      return options.tables;
    }

    const withoutActive = options.tables.filter((group) => group.name !== currentGroup);

    return [activeGroup, ...withoutActive];
  }, [currentGroup, options.tables, options.tabsSorting]);

  /**
   * Is Toolbar Visible
   */
  const isToolbarVisible = useMemo(() => {
    return sortedGroups.length > 1 || options.toolbar.export;
  }, [options.toolbar.export, sortedGroups.length]);

  /**
   * Content Sizes
   */
  const {
    containerRef: scrollableContainerRef,
    tableRef,
    headerRef,
    tableTopOffset,
    tableHeaderRef,
    paginationRef,
    tableBottomOffset,
  } = useContentSizes({ width, height, options, tableData });

  /**
   * Add Row
   */
  const onAddRow = useUpdateRow({ replaceVariables, currentTable, operation: 'add', setError });

  /**
   * Update Row
   */
  const onUpdateRow = useUpdateRow({ replaceVariables, currentTable, operation: 'update', setError });

  /**
   * Delete Row
   */
  const onDeleteRow = useUpdateRow({ replaceVariables, currentTable, operation: 'delete', setError });

  /**
   * Export
   */
  const onExport = useExportData({
    data: tableData,
    columns,
    tableConfig: currentTable,
    panelTitle: title,
    replaceVariables,
  });

  /**
   * Return
   */
  return (
    <tablePanelContext.Provider value={{ replaceVariables, setError }}>
      <div
        {...TEST_IDS.panel.root.apply()}
        className={styles.root}
        style={{
          width,
          height,
        }}
      >
        <div
          ref={scrollableContainerRef}
          className={styles.content}
          style={{
            width,
            height,
          }}
        >
          {!!error && (
            <AlertWithDetails details={error} variant="error" title="Request error" onRemove={() => setError('')} />
          )}
          {isToolbarVisible && (
            <div ref={headerRef} className={styles.header}>
              <ToolbarButtonRow alignment="left" key={currentGroup} className={styles.tabs}>
                {sortedGroups.length > 1 &&
                  sortedGroups.map((group, index) => (
                    <ToolbarButton
                      key={group.name}
                      variant={currentGroup === group.name ? 'active' : 'default'}
                      onClick={() => {
                        setCurrentGroup(group.name);
                      }}
                      className={styles.tabButton}
                      style={{
                        maxWidth: index === 0 ? width - 60 : undefined,
                      }}
                      {...TEST_IDS.panel.tab.apply(group.name)}
                    >
                      {group.name}
                    </ToolbarButton>
                  ))}
                {options.toolbar.export && (
                  <Button
                    icon="download-alt"
                    onClick={() => onExport({ table: tableInstance.current as never })}
                    variant="secondary"
                    size="sm"
                    {...TEST_IDS.panel.buttonDownload.apply()}
                  >
                    Download
                  </Button>
                )}
              </ToolbarButtonRow>
            </div>
          )}
          <Table
            key={currentTable?.name}
            expandedByDefault={currentTable?.expanded ?? false}
            data={tableData}
            columns={columns}
            tableRef={tableRef}
            tableHeaderRef={tableHeaderRef}
            topOffset={tableTopOffset}
            scrollableContainerRef={scrollableContainerRef}
            eventBus={eventBus}
            onUpdateRow={onUpdateRow}
            bottomOffset={tableBottomOffset}
            paginationRef={paginationRef}
            showHeader={currentTable?.showHeader ?? true}
            width={width}
            pagination={pagination}
            tableInstance={tableInstance as never}
            onAddRow={onAddRow}
            isAddRowEnabled={isAddRowEnabled}
            onDeleteRow={onDeleteRow}
            isDeleteRowEnabled={isDeleteRowEnabled}
          />
        </div>
      </div>
    </tablePanelContext.Provider>
  );
};
