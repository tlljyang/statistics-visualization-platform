declare module "jstat" {
  export interface JStat {
    normal: {
      inv(p: number, mean: number, stdDev: number): number;
    };
  }

  const jstat: JStat;
  export default jstat;
}
