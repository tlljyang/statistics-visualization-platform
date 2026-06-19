declare module "jstat" {
  export interface JStat {
    normal: {
      cdf(x: number, mean: number, stdDev: number): number;
      inv(p: number, mean: number, stdDev: number): number;
    };
  }

  const jstat: JStat;
  export default jstat;
}
