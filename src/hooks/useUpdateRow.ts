import { AlertErrorPayload, AlertPayload, AppEvents, InterpolateFunction, LoadingState } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';
import { useCallback } from 'react';

import { TableConfig } from '@/types';

import { useDatasourceRequest } from './useDatasourceRequest';

export const useUpdateRow = ({
  replaceVariables,
  currentTable,
}: {
  replaceVariables: InterpolateFunction;
  currentTable?: TableConfig;
}) => {
  /**
   * App Events
   */
  const appEvents = getAppEvents();
  const notifySuccess = useCallback(
    (payload: AlertPayload) => appEvents.publish({ type: AppEvents.alertSuccess.name, payload }),
    [appEvents]
  );
  const notifyError = useCallback(
    (payload: AlertErrorPayload) => appEvents.publish({ type: AppEvents.alertError.name, payload }),
    [appEvents]
  );

  /**
   * Data Source Request
   */
  const datasourceRequest = useDatasourceRequest();

  /**
   * Update Row
   */
  return useCallback(
    async (row: unknown) => {
      const updateRequest = currentTable?.update;

      /**
       * No update request
       */
      if (!updateRequest) {
        return;
      }

      try {
        const response = await datasourceRequest({
          query: updateRequest.payload,
          datasource: updateRequest.datasource,
          replaceVariables,
          payload: row,
        });

        /**
         * Query Error
         */
        if (response.state === LoadingState.Error) {
          throw response.errors;
        }

        notifySuccess(['Success', 'Values updated successfully.']);
        appEvents.publish({ type: 'variables-changed', payload: { refreshAll: true } });
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e : Array.isArray(e) ? e[0] : 'Unknown Error';
        notifyError(['Error', errorMessage]);
        throw e;
      }
    },
    [appEvents, currentTable?.update, datasourceRequest, notifyError, notifySuccess, replaceVariables]
  );
};
