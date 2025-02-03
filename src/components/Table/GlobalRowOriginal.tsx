let globalValue: string = "NOT_EDITING";

export const getGlobalValue = () => globalValue;
export const setGlobalValue = (newValue: string) => {
  globalValue = newValue;
}; 