/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { reflector } from '../reflection/reflection';
import { Type } from '../facade/type';

import { resolveForwardRef } from '../forward_ref';
import { InjectionToken } from '../injection_token';
import { Inject, Optional, Self, SkipSelf } from '../metadata';
import { isClassProvider, isExistingProvider, isFactoryProvider, NormalizedProvider, Provider } from './provider';
import { noAnnotationError } from '../reflective_errors';
import { ReflectiveKey } from '../reflective_key';
import { ReflectiveDependency } from '../dependency';
import { ResolvedReflectiveFactory } from '../reflective_factory';

const _EMPTY_LIST: any[] = [];

/**
 * An internal resolved representation of a {@link Provider} used by the {@link Injector}.
 *
 * It is usually created automatically by `Injector.resolveAndCreate`.
 *
 * It can be created manually, as follows:
 *
 * ### Example ([live demo](http://plnkr.co/edit/RfEnhh8kUEI0G3qsnIeT?p%3Dpreview&p=preview))
 *
 * ```typescript
 * var resolvedProviders = Injector.resolve([{ provide: 'message', useValue: 'Hello' }]);
 * var injector = Injector.fromResolvedProviders(resolvedProviders);
 *
 * expect(injector.get('message')).toEqual('Hello');
 * ```
 *
 * @experimental
 */
export interface ResolvedReflectiveProvider {
  /**
   * A key, usually a `Type<any>`.
   */
  key: ReflectiveKey;

  /**
   * Factory function which can return an instance of an object represented by a key.
   */
  resolvedFactories: ResolvedReflectiveFactory[];

  /**
   * Indicates if the provider is a multi-provider or a regular provider.
   */
  multiProvider: boolean;
}

// tslint:disable-next-line:class-name
export class ResolvedReflectiveProvider_ implements ResolvedReflectiveProvider {
  constructor(public key: ReflectiveKey, public resolvedFactories: ResolvedReflectiveFactory[], public multiProvider: boolean) {}

  get resolvedFactory(): ResolvedReflectiveFactory {
    return this.resolvedFactories[0];
  }
}

export class ReflectiveProviderResolver {
  /**
   * Shallow clone the {@link ResolvedReflectiveProvider}.
   *
   * Only occur within multi merge scenario
   *
   */
  static shallow(provider: ResolvedReflectiveProvider): ResolvedReflectiveProvider {
    // 后续合并动作不应该影响原始的 ReflectiveProvider，因而需要进行浅克隆，务必注意
    return new ResolvedReflectiveProvider_(provider.key, provider.resolvedFactories.slice(), provider.multiProvider);
  }

  /**
   * Converts the Provider into ResolvedProvider.
   *
   * {@link Injector} internally only uses {@link ResolvedProvider}, {@link Provider} contains
   * convenience provider syntax.
   */
  static resolve(provider: NormalizedProvider): ResolvedReflectiveProvider {
    return new ResolvedReflectiveProvider_(
      ReflectiveKey.get(provider.provide),
      [resolveReflectiveFactory(provider)],
      provider.multi || false
    );
  }
}

/**
 * Resolve a single provider.
 */
function resolveReflectiveFactory(provider: NormalizedProvider): ResolvedReflectiveFactory {
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

/**
 * Factory 提取依赖
 */
export function constructDependencies(typeOrFunc: any, dependencies?: any[]): ReflectiveDependency[] {
  if (!dependencies) {
    return _dependenciesFor(typeOrFunc);
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

function _extractToken(typeOrFunc: any, metadata: any[] | any, params: any[][]): ReflectiveDependency {
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

function _createDependency(token: any, optional: boolean, visibility: Self | SkipSelf | null): ReflectiveDependency {
  return new ReflectiveDependency(ReflectiveKey.get(token), optional, visibility);
}
