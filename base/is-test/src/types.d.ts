
export interface IAppConf {
  /**
   * 应用启动端口
   */
  port: number;
  /**
   * 应用对应的hel组名
   */
  appGroupName: number;
  /**
   * 应用对应的多环境hel应用名
   */
  appNames: string[];
  alias: string;
}

export type AppConfs = Record<string, IAppConf>;

export interface IDevInfo {
  appExternals: Record<string, IAppConf>,
  appConfs: AppConfs;
}
