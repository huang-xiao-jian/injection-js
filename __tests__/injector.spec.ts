/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { InjectionToken, Injector } from '../lib';

const MISSING_TOKEN = new InjectionToken('Missing');

describe('Injector.NULL', () => {
  it('should throw if no arg is given', () => {
    expect(() => Injector.NULL.get(MISSING_TOKEN)).toThrowError('No provider for InjectionToken Missing!');
  });

  it('should throw if THROW_IF_NOT_FOUND is given', () => {
    expect(() => Injector.NULL.get(MISSING_TOKEN, Injector.THROW_IF_NOT_FOUND)).toThrowError('No provider for InjectionToken Missing!');
  });

  it('should return the default value', () => {
    expect(Injector.NULL.get(MISSING_TOKEN, 'Not Found')).toEqual('Not Found');
  });
});
