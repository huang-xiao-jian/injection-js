import { ReflectiveDependency } from '../dependency';
import { Type } from '../facade/type';
import { resolveForwardRef } from '../forward_ref';
import { InjectionToken } from '../injection_token';
import { Inject, Optional, Self, SkipSelf } from '../metadata';
import {
  NormalizedProvider,
  isClassProvider,
  isExistingProvider,
  isFactoryProvider,
} from '../provider';
import { reflector } from '../reflection/reflection';
import { noAnnotationError } from '../reflective_errors';
import { ReflectiveKey } from '../reflective_key';
import { ResolvedReflectiveFactory } from './reflective_factory';

const _EMPTY_LIST: any[] = [];

/**
 * Resolve a single provider.
 */
export class ReflectiveFactoryResolver {
  static resolve(provider: NormalizedProvider): ResolvedReflectiveFactory {
    let factoryFn: Function;
    let resolvedDeps: ReflectiveDependency[];
    if (isClassProvider(provider)) {
      const useClass = resolveForwardRef(provider.useClass);
      factoryFn = reflector.factory(useClass);
      resolvedDeps = _dependenciesFor(useClass);
    } else if (isExistingProvider(provider)) {
      factoryFn = (aliasInstance: any) => aliasInstance;
      resolvedDeps = [ReflectiveDependency.fromKey(ReflectiveKey.get(provider.useExisting))];
    } else if (isFactoryProvider(provider)) {
      factoryFn = provider.useFactory;
      resolvedDeps = constructDependencies(provider.useFactory, provider.deps);
    } else {
      factoryFn = () => provider.useValue;
      resolvedDeps = _EMPTY_LIST;
    }

    return new ResolvedReflectiveFactory(factoryFn, resolvedDeps);
  }
}

/**
 * Factory 提取依赖
 */
export function constructDependencies(
  typeOrFunc: any,
  dependencies?: any[],
): ReflectiveDependency[] {
  // useFactory 未声明依赖，直接判定为无依赖
  if (!dependencies) {
    return _EMPTY_LIST;
  } else {
    // TODO - 为什么转化为数组
    const params: any[][] = dependencies.map((t) => [t]);
    return dependencies.map((t) => _extractToken(typeOrFunc, t, params));
  }
}

/**
 * Class 类提取依赖
 */
function _dependenciesFor(typeOrFunc: any): ReflectiveDependency[] {
  const params = reflector.parameters(typeOrFunc);

  if (!params) return [];
  /**
   * 强制要求构造函数参数必须存在注解，避免难以调试的问题
   */
  if (params.some((p) => p == null)) {
    throw noAnnotationError(typeOrFunc, params);
  }
  return params.map((p) => _extractToken(typeOrFunc, p, params));
}

function _extractToken(
  typeOrFunc: any,
  metadata: any[] | any,
  params: any[][],
): ReflectiveDependency {
  let token: any = null;
  let optional = false;

  /**
   * 非数组的场景又是什么历史典故，暂且不管了
   */
  if (!Array.isArray(metadata)) {
    if (metadata instanceof Inject) {
      return _createDependency(metadata['token'], optional, null);
    } else {
      return _createDependency(metadata, optional, null);
    }
  }

  let visibility: Self | SkipSelf | null = null;

  /**
   * 每一个参数都存在多个注解，需要集中考虑
   */
  for (let i = 0; i < metadata.length; ++i) {
    const paramMetadata = metadata[i];
    /**
     * 原始类
     */
    if (paramMetadata instanceof Type) {
      token = paramMetadata;
    } else if (paramMetadata instanceof Inject) {
      token = paramMetadata['token'];
    } else if (paramMetadata instanceof Optional) {
      optional = true;
    } else if (paramMetadata instanceof Self || paramMetadata instanceof SkipSelf) {
      visibility = paramMetadata;
    } else if (paramMetadata instanceof InjectionToken) {
      token = paramMetadata;
    }
  }

  token = resolveForwardRef(token);

  if (token != null) {
    return _createDependency(token, optional, visibility);
  } else {
    throw noAnnotationError(typeOrFunc, params);
  }
}

function _createDependency(
  token: any,
  optional: boolean,
  visibility: Self | SkipSelf | null,
): ReflectiveDependency {
  return new ReflectiveDependency(ReflectiveKey.get(token), optional, visibility);
}
