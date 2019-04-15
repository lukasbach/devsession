/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
import {DeepPartial} from "../types/deeppartial";

export function isObject(item: any) {
  return (item && typeof item === "object" && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 */
export function mergeDeep<T, S extends T = T>(target: T, ...sources: Array<DeepPartial<S>>): T {
  if (!sources.length) { return target; }
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!Object.keys(target).includes(key)) { Object.assign(target, { [key]: {} }); }
        mergeDeep((target as any)[key], (source as any)[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}
