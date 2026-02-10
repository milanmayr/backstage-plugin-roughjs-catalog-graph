# Catalog Graph Excalidraw

A frontend-only Backstage plugin that provides Excalidraw-style (hand-drawn, sketchy) node and edge renderers for the [catalog graph](https://backstage.io/docs/features/software-catalog/catalog-graph). Use it with `EntityCatalogGraphCard` and `CatalogGraphPage` from `@backstage/plugin-catalog-graph`.

## Installation

Add the plugin to your Backstage app:

```bash
yarn add @internal/backstage-plugin-catalog-graph-excalidraw
```

If you use a monorepo with workspaces, add the package to your app's `package.json` dependencies (e.g. `"@internal/backstage-plugin-catalog-graph-excalidraw": "^0.1.0"` or a workspace reference).

The plugin requires:

- `@backstage/plugin-catalog-graph` (you already have this if you show the catalog graph)
- `@backstage/core-components`
- `@backstage/theme`
- `react`

## Usage

The plugin exports `ExcalidrawNode` and `ExcalidrawEdge` (and a convenience object `excalidrawGraphRenderers`). Pass them as `renderNode` and `renderEdge` wherever you use the catalog graph.

### 1. Catalog graph page (standalone)

In the file where you render `CatalogGraphPage` (e.g. `packages/app/src/App.tsx`):

```tsx
import { CatalogGraphPage, Direction } from '@backstage/plugin-catalog-graph';
import {
  ExcalidrawNode,
  ExcalidrawEdge,
} from '@internal/backstage-plugin-catalog-graph-excalidraw';

// In your routes:
<Route
  path="/catalog-graph"
  element={
    <CatalogGraphPage
      initialState={{ maxDepth: 1, direction: Direction.TOP_BOTTOM }}
      renderNode={ExcalidrawNode}
      renderEdge={ExcalidrawEdge}
    />
  }
/>;
```

### 2. Entity catalog graph cards

In the file where you use `EntityCatalogGraphCard` (e.g. `packages/app/src/components/catalog/EntityPage.tsx`):

```tsx
import { EntityCatalogGraphCard } from '@backstage/plugin-catalog-graph';
import {
  ExcalidrawNode,
  ExcalidrawEdge,
} from '@internal/backstage-plugin-catalog-graph-excalidraw';

// For each EntityCatalogGraphCard, add the renderers:
<EntityCatalogGraphCard
  variant="gridItem"
  height={400}
  renderNode={ExcalidrawNode}
  renderEdge={ExcalidrawEdge}
/>;
```

Add `renderNode={ExcalidrawNode}` and `renderEdge={ExcalidrawEdge}` to every `EntityCatalogGraphCard` instance (overview cards, diagram tab, etc.) where you want the Excalidraw style.

### Convenience object

You can use the bundled object to avoid repeating imports:

```tsx
import { excalidrawGraphRenderers } from '@internal/backstage-plugin-catalog-graph-excalidraw';

<CatalogGraphPage
  renderNode={excalidrawGraphRenderers.renderNode}
  renderEdge={excalidrawGraphRenderers.renderEdge}
/>;
```

## Layout and spacing

Node spacing (distance between nodes) is controlled by `@backstage/plugin-catalog-graph` and its layout defaults. The plugin does not currently expose `nodeMargin` or `rankMargin` to `DependencyGraph`. To get more space between nodes, you would need the upstream catalog-graph plugin to support and forward those props, or to use a custom graph wrapper that does.

## Development

From the plugin directory:

```bash
yarn start
```

This opens a dev app with a sample graph page at `/excalidraw-graph` so you can develop and test the renderers in isolation.

## License

Apache-2.0
