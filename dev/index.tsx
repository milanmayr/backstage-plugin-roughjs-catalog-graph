import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { catalogGraphExcalidrawPlugin } from '../src/plugin';
import { ExcalidrawNode, ExcalidrawEdge } from '../src';
import {
  DependencyGraph,
  DependencyGraphTypes,
} from '@backstage/core-components';

const sampleNodes: DependencyGraphTypes.DependencyNode<unknown>[] = [
  { id: 'node-a' },
  { id: 'node-b' },
  { id: 'node-c' },
];

const sampleEdges: DependencyGraphTypes.DependencyEdge<unknown>[] = [
  { from: 'node-a', to: 'node-b' },
  { from: 'node-b', to: 'node-c' },
];

const ExcalidrawGraphDemo = () => (
  <div style={{ padding: 24, height: 10000 }}>
    <DependencyGraph
      nodes={sampleNodes}
      edges={sampleEdges}
      direction={DependencyGraphTypes.Direction.LEFT_RIGHT}
      renderNode={ExcalidrawNode}
      renderEdge={ExcalidrawEdge}
    />
  </div>
);

createDevApp()
  .registerPlugin(catalogGraphExcalidrawPlugin)
  .addPage({
    element: <ExcalidrawGraphDemo />,
    title: 'Excalidraw Graph',
    path: '/excalidraw-graph',
  })
  .render();
