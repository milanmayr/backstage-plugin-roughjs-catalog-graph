export { catalogGraphExcalidrawPlugin } from './plugin';
export { ExcalidrawNode } from './components/ExcalidrawNode';
export { ExcalidrawEdge } from './components/ExcalidrawEdge';

import { ExcalidrawNode } from './components/ExcalidrawNode';
import { ExcalidrawEdge } from './components/ExcalidrawEdge';

export const excalidrawGraphRenderers = {
  renderNode: ExcalidrawNode,
  renderEdge: ExcalidrawEdge,
};
