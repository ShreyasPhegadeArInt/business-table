let globalValue: string = "Initial Value";

export const getGlobalValue = () => globalValue;
export const setGlobalValue = (newValue: string) => {
  globalValue = newValue;
}; 