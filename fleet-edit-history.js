/*!
 * Fleet edit history. JavaScript adaptation of VectorCraft's edit history.
 * Upstream revision 04edd114b1b584632ad2e2842df1d2a7316c6481, under MIT.
 * https://github.com/storytold/vectorcraft/blob/04edd114b1b584632ad2e2842df1d2a7316c6481/crates/engine/src/cmd/edit.rs#L685-L738
 * https://github.com/storytold/vectorcraft/blob/04edd114b1b584632ad2e2842df1d2a7316c6481/crates/engine/src/doc_state.rs#L447-L450
 * https://github.com/storytold/vectorcraft/blob/04edd114b1b584632ad2e2842df1d2a7316c6481/crates/engine/src/history.rs
 * https://github.com/storytold/vectorcraft/blob/04edd114b1b584632ad2e2842df1d2a7316c6481/LICENSE-MIT
 *
 * Adapted the named snapshot swap, redo invalidation on a fresh edit, and
 * count-based trimming. JavaScript references share immutable snapshots.
 *
 * MIT License
 *
 * Copyright (c) 2026 ArtCraft Team and the VectorCraft contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function (root) {
  'use strict';

  // Give each document or round its own history. Treat every committed value
  // as immutable, including shared children. A no-op may reuse history.value.
  function createFleetEditHistory(initialValue, limit = 48) {
    if (!Number.isSafeInteger(limit) || limit < 1) {
      throw new RangeError('Edit history needs a positive integer step limit.');
    }
    let value = initialValue;
    const past = [];
    const future = [];

    function transfer(source, destination) {
      const entry = source.pop();
      if (!entry) return null;
      destination.push({label: entry.label, value});
      value = entry.value;
      return entry.label;
    }
    return {
      get value() { return value; },
      get canUndo() { return past.length > 0; },
      get canRedo() { return future.length > 0; },
      commit(label, nextValue) {
        if (Object.is(value, nextValue)) return false;
        past.push({label, value});
        future.length = 0;
        if (past.length > limit) past.shift();
        value = nextValue;
        return true;
      },
      undo() { return transfer(past, future); },
      redo() { return transfer(future, past); }
    };
  }
  if (typeof module === 'object' && module && module.exports) {
    module.exports = createFleetEditHistory;
  } else {
    root.createFleetEditHistory = createFleetEditHistory;
  }
})(globalThis);
