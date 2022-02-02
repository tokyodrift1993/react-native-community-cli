import t, {SchemaLike} from 'joi';

const map = (key: RegExp | SchemaLike, value: SchemaLike) =>
  t.object().unknown(true).pattern(key, value);

/**
 * Schema for CommandT
 */
const command = t.object({
  name: t.string().required(),
  description: t.string(),
  usage: t.string(),
  func: t.func().required(),
  options: t.array().items(
    t
      .object({
        name: t.string().required(),
        description: t.string(),
        parse: t.func(),
        default: t
          .alternatives()
          .try(t.bool(), t.number(), t.string().allow(''), t.func()),
      })
      .rename('command', 'name', {ignoreUndefined: true}),
  ),
  examples: t.array().items(
    t.object({
      desc: t.string().required(),
      cmd: t.string().required(),
    }),
  ),
});

/**
 * Schema for HealthChecksT
 */
const healthCheck = t.object({
  label: t.string().required(),
  healthchecks: t.array().items(
    t.object({
      label: t.string().required(),
      isRequired: t.bool(),
      description: t.string(),
      getDiagnostics: t.func(),
      win32AutomaticFix: t.func(),
      darwinAutomaticFix: t.func(),
      linuxAutomaticFix: t.func(),
      runAutomaticFix: t.func().required(),
    }),
  ),
});

/**
 * Schema for UserDependencyConfigT
 */
export const dependencyConfig = t
  .object({
    dependency: t
      .object({
        platforms: map(t.string(), t.any())
          .keys({
            ios: t
              // IOSDependencyConfig
              .object({
                project: t.string(),
                podspecPath: t.string(),
                sharedLibraries: t.array().items(t.string()),
                libraryFolder: t.string(),
                scriptPhases: t.array().items(t.object()),
                configurations: t.array().items(t.string()).default([]),
              })
              .default({}),
            android: t
              // AndroidDependencyParams
              .object({
                sourceDir: t.string(),
                manifestPath: t.string(),
                packageName: t.string(),
                packageImportPath: t.string(),
                packageInstance: t.string(),
                dependencyConfiguration: t.string(),
                buildTypes: t.array().items(t.string()).default([]),
              })
              .default({}),
          })
          .default(),
      })
      .default(),
    platforms: map(
      t.string(),
      t.object({
        npmPackageName: t.string().optional(),
        dependencyConfig: t.func(),
        projectConfig: t.func(),
        linkConfig: t.func(),
      }),
    ).default({}),
    commands: t.array().items(command).default([]),
    healthChecks: t.array().items(healthCheck).default([]),
  })
  .unknown(true)
  .default();

/**
 * Schema for ProjectConfigT
 */
export const projectConfig = t
  .object({
    dependencies: map(
      t.string(),
      t
        .object({
          root: t.string(),
          platforms: map(t.string(), t.any()).keys({
            ios: t
              // IOSDependencyConfig
              .object({
                podspecPath: t.string(),
                configurations: t.array().items(t.string()).default([]),
                scriptPhases: t.array().items(t.string()).default([]),
              })
              .allow(null),
            android: t
              // AndroidDependencyConfig
              .object({
                sourceDir: t.string(),
                packageImportPath: t.string(),
                packageInstance: t.string(),
                dependencyConfiguration: t.string(),
                buildTypes: t.array().items(t.string()).default([]),
              })
              .allow(null),
          }),
        })
        .allow(null),
    ).default({}),
    reactNativePath: t.string(),
    project: map(t.string(), t.any())
      .keys({
        ios: t
          // IOSProjectParams
          .object({
            sourceDir: t.string(),
          })
          .default({}),
        android: t
          // AndroidProjectParams
          .object({
            sourceDir: t.string(),
            appName: t.string(),
            manifestPath: t.string(),
            packageName: t.string(),
            dependencyConfiguration: t.string(),
          })
          .default({}),
      })
      .default(),
    assets: t.array().items(t.string()).default([]),
    commands: t.array().items(command).default([]),
    platforms: map(
      t.string(),
      t.object({
        npmPackageName: t.string().optional(),
        dependencyConfig: t.func(),
        projectConfig: t.func(),
        linkConfig: t.func(),
      }),
    ).default({}),
  })
  .unknown(true)
  .default();
