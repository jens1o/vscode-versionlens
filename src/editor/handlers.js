/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as path from 'path';
import * as minimatch from 'minimatch';
import appSettings from '../common/appSettings';
import { getDecorationsByLine, removeDecorations } from './decorations';

export function onActiveEditorChanged(editor, providers) {
  if (!editor || !editor.document) {
    appSettings.isActive = false;
    return;
  }

  const filename = path.basename(editor.document.fileName);
  for (var i = 0; i < providers.length; i++) {
    if (minimatch(filename, providers[i].selector.pattern)) {
      appSettings.isActive = true;
      return;
    }
  }

  appSettings.isActive = false;
}

// update the decorators if the changed line affects them
export function onChangeTextDocument(changeEvent) {
  const foundDecorations = [];
  const { contentChanges } = changeEvent;

  // get all decorations for all the lines that have changed
  contentChanges.forEach(change => {
    const startLine = change.range.start.line;
    const endLine = change.range.end.line;
    for (let line = startLine; line <= endLine; line++) {
      const lineDecorations = getDecorationsByLine(line);
      if (lineDecorations.length > 0)
        foundDecorations.push(...lineDecorations);
    }
  })

  if (foundDecorations.length === 0)
    return;

  // remove all decorations that have changed
  removeDecorations(foundDecorations);
}