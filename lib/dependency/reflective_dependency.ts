/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Self, SkipSelf } from '../metadata';
import { ReflectiveKey } from '../reflective_key';

/**
 * `Dependency` is used by the framework to extend DI.
 * This is internal to Angular and should not be used directly.
 */
export class ReflectiveDependency {
  constructor(public key: ReflectiveKey, public optional: boolean, public visibility: Self | SkipSelf | null) {}

  static fromKey(key: ReflectiveKey): ReflectiveDependency {
    return new ReflectiveDependency(key, false, null);
  }
}
