import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    root: css`
      &:last-child {
        margin-bottom: 0;
        border-bottom: 0;
      }

      img {
        max-width: 100%;
      }

      li {
        margin-left: ${theme.spacing(2)};
      }

      a {
        color: ${theme.colors.text.link};
      }

      table {
        border-collapse: collapse;

        th,
        td {
          padding: ${theme.spacing(0.5)} ${theme.spacing(1)};
          border-top: 1px solid ${theme.colors.border.medium};
          border-left: 1px solid ${theme.colors.border.medium};
        }

        th {
          font-weight: ${theme.typography.fontWeightMedium};
          background: ${theme.colors.background.secondary};
        }

        border-bottom: 1px solid ${theme.colors.border.medium};
        border-right: 1px solid ${theme.colors.border.medium};
      }

      blockquote {
        margin: ${theme.spacing(2)} 0;
        border-left: 5px solid ${theme.colors.border.strong};
        padding: ${theme.spacing(1)};
        padding-left: ${theme.spacing(2)};

        p {
          font-size: ${theme.typography.body.fontSize};
          color: ${theme.colors.text.secondary};
        }
      }
    `,
  };
};
