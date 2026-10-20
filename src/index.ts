/**
 * 默认参数
 */
const DEFAULT: Required<DatasetConfigOptions> = {
  prefix: "",
  parseFunction: true,
  excludeKeys: [],
};

export interface DatasetConfigOptions {
  prefix?: string;
  parseFunction?: boolean;
  excludeKeys?: string[];
}

/**
 * 解析元素上的 data-* 属性
 *
 * @param element
 * @param options
 */
export default function datasetConfig(
  element: HTMLElement,
  options: DatasetConfigOptions = {},
): Record<string, unknown> {
  const opts: Required<DatasetConfigOptions> = {
    ...DEFAULT,
    ...options,
  };

  const prefix = normalizePrefix(opts.prefix);
  const prefixLength = prefix.length;

  const excludePaths = opts.excludeKeys.map(normalizePath);

  const data: Record<string, unknown> = {};

  for (const key in element.dataset) {
    const value = element.dataset[key];

    if (value === undefined) {
      continue;
    }

    let realKey: string;

    if (prefix) {
      if (!matchPrefix(key, prefix)) {
        continue;
      }

      realKey = pascalToCamel(key.slice(prefixLength));
    } else {
      realKey = key;
    }

    const path = normalizePath(realKey);

    if (isExcluded(path, excludePaths)) {
      continue;
    }

    setDeepProperty(data, path, parseValue(value, opts.parseFunction));
  }

  return data;
}

/**
 * 是否排除
 */
function isExcluded(targetPath: string[], excludePaths: string[][]): boolean {
  return excludePaths.some((excludePath) => {
    if (excludePath.length > targetPath.length) {
      return false;
    }

    return excludePath.every((part, i) => part === targetPath[i]);
  });
}

type DataObject = Record<string, unknown>;

/**
 * 设置深层对象
 */
function setDeepProperty(obj: DataObject, keys: string[], value: unknown): void {
  const lastKey = keys.at(-1);

  if (!lastKey) {
    return;
  }

  const parents = keys.slice(0, -1);

  let current: DataObject = obj;

  for (const key of parents) {
    const existing = current[key];

    if (!Object.hasOwn(current, key) || typeof existing !== "object" || existing === null) {
      current[key] = {};
    }

    current = current[key] as DataObject;
  }

  current[lastKey] = value;
}

/**
 * 解析值
 */
function parseValue(value: string, parseFunction: boolean): unknown {
  if (parseFunction) {
    const fn = Reflect.get(window, value);

    if (typeof fn === "function") {
      return fn;
    }
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (value === "null") {
    return null;
  }

  if (value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }

  if (
    (value.startsWith("{") && value.endsWith("}")) ||
    (value.startsWith("[") && value.endsWith("]"))
  ) {
    try {
      return JSON.parse(value);
    } catch {
      // ignore
    }
  }

  return value;
}

/**
 * 将路径统一转换成数组
 *
 * config.foo-delay
 *
 * =>
 *
 * ["config","fooDelay"]
 */
function normalizePath(path: string): string[] {
  return kebabToCamel(path).split(".").map(pascalToCamel);
}

/**
 * prefix 标准化
 */
function normalizePrefix(prefix: string): string {
  return kebabToCamel(prefix);
}

/**
 * kebab-case -> camelCase
 */
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, p1: string) => p1.toUpperCase());
}

/**
 * Pascal -> camel
 */
function pascalToCamel(str: string): string {
  return str ? str.charAt(0).toLowerCase() + str.slice(1) : "";
}

/**
 * 判断 dataset key 是否匹配 prefix
 */
function matchPrefix(key: string, prefix: string): boolean {
  if (!key.startsWith(prefix)) {
    return false;
  }

  const next = key[prefix.length];

  return next !== undefined && /[A-Z]/.test(next);
}
