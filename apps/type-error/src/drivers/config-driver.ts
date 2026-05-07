import xs, { type Stream } from "xstream";

export interface Config {
  width: number;
  height: number;
  testType: string;
}

export function makeConfigDriver(): () => Stream<Config> {
  return function configDriver(): Stream<Config> {
    return xs.of({
      width: 760,
      height: 460,
      testType: "two-tailed",
    });
  };
}
