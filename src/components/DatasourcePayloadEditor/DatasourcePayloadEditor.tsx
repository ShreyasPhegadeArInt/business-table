import { DataSourceApi } from '@grafana/data';
import { getDataSourceSrv } from '@grafana/runtime';
import { DataQuery } from '@grafana/schema';
import { Alert, LoadingPlaceholder } from '@grafana/ui';
import React, { useCallback, useEffect, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { useAutoSave } from '@/hooks';

/**
 * Properties
 */
interface Props {
  /**
   * Value
   *
   * @type {Record<string, unknown>}
   */
  value: unknown;

  /**
   * Change
   */
  onChange: (value: unknown) => void;

  /**
   * Data Source Name
   *
   * @type {string}
   */
  datasourceName: string;
}

/**
 * Payload Editor
 */
export const DatasourcePayloadEditor: React.FC<Props> = ({ value, onChange, datasourceName }) => {
  /**
   * Data Source Service
   */
  const dataSourceService = getDataSourceSrv();

  /**
   * Data Source
   */
  const [datasource, setDatasource] = useState<DataSourceApi>();
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Query Auto Save
   */
  const { startTimer, removeTimer } = useAutoSave();
  const [query, setQuery] = useState(value);
  const [isChanged, setIsChanged] = useState(false);

  /**
   * On Change Query
   */
  const onChangeQuery = useCallback((query: unknown) => {
    setQuery(query);
    setIsChanged(true);
  }, []);

  /**
   * On Run query
   */
  const onRunQuery = useCallback(() => null, []);

  /**
   * Save Updates
   */
  const onSaveUpdates = useCallback(() => {
    onChange(query);
    setIsChanged(false);
  }, [onChange, query]);

  /**
   * Load Query Editor
   */
  useEffect(() => {
    const getDataSource = async () => {
      setIsLoading(true);

      const ds = await dataSourceService.get(datasourceName);

      setDatasource(ds);
      setIsLoading(false);
    };

    /**
     * Reset query if new datasource
     */
    if (datasource && datasource.name !== datasourceName) {
      onChangeQuery({});
    }

    /**
     * Load data source
     */
    if (datasourceName && (!datasource || datasource.name !== datasourceName)) {
      getDataSource();
    }
  }, [datasourceName, dataSourceService, datasource, onChangeQuery]);

  /**
   * Auto Save Timer
   */
  useEffect(() => {
    if (isChanged) {
      startTimer(onSaveUpdates);
    } else {
      removeTimer();
    }

    return () => {
      removeTimer();
    };
  }, [startTimer, isChanged, onSaveUpdates, removeTimer]);

  if (isLoading) {
    return (
      <Alert severity="info" title="Please Wait" {...TEST_IDS.payloadEditor.loadingMessage.apply()}>
        <LoadingPlaceholder text="Loading..." />
      </Alert>
    );
  }

  /**
   * No editor or data source
   */
  if (!datasource || !datasource.components?.QueryEditor) {
    return <Alert title="No Query Editor" severity="error" {...TEST_IDS.payloadEditor.errorMessage.apply()} />;
  }

  /**
   * Query Editor
   */
  const Editor = datasource.components.QueryEditor;

  return <Editor datasource={datasource} query={query as DataQuery} onChange={onChangeQuery} onRunQuery={onRunQuery} />;
};