
type Version7Options = {
  random?: Uint8Array;
  msecs?: number;
  seq?: number;
  rng?: () => Uint8Array;
};


type V7State = {
  msecs?: number;
  seq?: number;
};

export declare function v7(options?: Version7Options, buf?: undefined, offset?: number): string;
