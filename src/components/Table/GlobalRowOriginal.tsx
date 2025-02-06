let globalValue: string = "NOT_EDITING";
let currRowInEdit: string = "";
// let originalRow: string = "";
let oRInd = -1;

export const getGlobalValue = () => globalValue;
export const setGlobalValue = (newValue: string) => {
  globalValue = newValue;
};

export const getRIE = () => currRowInEdit;
export const setRIE = (newRow: string) => {
  currRowInEdit = newRow;
};

// export const getOR = () => originalRow;
// export const setOR = (newRow: string) => {
//   originalRow = newRow;
// };

export const getRowInd = () => oRInd;
export const setRowInd = (newInd: number) => {
  oRInd = newInd;
};
