/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * The `di` module provides dependency injection container services.
 */

export * from './metadata';

export { forwardRef, resolveForwardRef, ForwardRefFn } from './forward_ref';

export { Injector, ReflectiveInjector } from './injector';
export {
  Provider,
  TypeProvider,
  ValueProvider,
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  ResolvedReflectiveProvider,
} from './provider';
export * from './dependency';
export { ResolvedReflectiveFactory } from './factory/reflective_factory';
export { ReflectiveKey } from './reflective_key';
export { InjectionToken } from './injection_token';
export {
  Class,
  TypeDecorator,
  makeDecorator,
  makeParamDecorator,
  makePropDecorator,
} from './util/decorators';
export { Type, isType } from './facade/type';
