import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type {
  Topology,
  TopologyAction,
  Selection,
  EditorState,
  ViewportState,
} from '../types/topology';
import { builtInAssets } from '../assets/builtInAssets';

interface TopologyContextState {
  topology: Topology;
  selection: Selection;
  editorState: EditorState;
  viewport: ViewportState;
  dispatch: React.Dispatch<TopologyAction>;
  setSelection: (selection: Selection) => void;
  setEditorState: (state: Partial<EditorState>) => void;
  setViewport: (viewport: Partial<ViewportState>) => void;
}

const TopologyContext = createContext<TopologyContextState | undefined>(undefined);

// Initial state
const initialTopology: Topology = {
  meta: {
    title: 'Untitled Topology',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0',
  },
  canvas: {
    width: 4000,
    height: 3000,
    gridSize: 20,
    snapToGrid: true,
    showGrid: true,
    backgroundColor: '#1a1a1a',
  },
  assets: [...builtInAssets], // Include built-in assets by default
  devices: [],
  links: [],
  groups: [],
  shapes: [],
  texts: [],
};

const initialSelection: Selection = {
  deviceIds: [],
  linkIds: [],
  groupIds: [],
  shapeIds: [],
  textIds: [],
};

const initialEditorState: EditorState = {
  tool: 'select',
  isDrawing: false,
  isPanning: false,
};

const initialViewport: ViewportState = {
  x: 0,
  y: 0,
  scale: 1,
};

// Reducer
function topologyReducer(state: Topology, action: TopologyAction): Topology {
  switch (action.type) {
    case 'SET_TOPOLOGY':
      return { ...action.payload, meta: { ...action.payload.meta, updatedAt: new Date().toISOString() } };

    case 'ADD_ASSET':
      return { ...state, assets: [...state.assets, action.payload] };

    case 'REMOVE_ASSET':
      return {
        ...state,
        assets: state.assets.filter((a) => a.id !== action.payload),
      };

    case 'ADD_DEVICE':
      return { ...state, devices: [...state.devices, action.payload] };

    case 'UPDATE_DEVICE':
      return {
        ...state,
        devices: state.devices.map((d) =>
          d.id === action.payload.id ? { ...d, ...action.payload.updates } : d
        ),
      };

    case 'REMOVE_DEVICE':
      return {
        ...state,
        devices: state.devices.filter((d) => d.id !== action.payload),
        // Also remove links connected to this device
        links: state.links.filter(
          (l) => l.from.deviceId !== action.payload && l.to.deviceId !== action.payload
        ),
      };

    case 'ADD_LINK':
      return { ...state, links: [...state.links, action.payload] };

    case 'UPDATE_LINK':
      return {
        ...state,
        links: state.links.map((l) =>
          l.id === action.payload.id ? { ...l, ...action.payload.updates } : l
        ),
      };

    case 'REMOVE_LINK':
      return {
        ...state,
        links: state.links.filter((l) => l.id !== action.payload),
      };

    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups, action.payload] };

    case 'UPDATE_GROUP':
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.payload.id ? { ...g, ...action.payload.updates } : g
        ),
      };

    case 'REMOVE_GROUP':
      return {
        ...state,
        groups: state.groups.filter((g) => g.id !== action.payload),
      };

    case 'ADD_SHAPE':
      return { ...state, shapes: [...state.shapes, action.payload] };

    case 'UPDATE_SHAPE':
      return {
        ...state,
        shapes: state.shapes.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
        ),
      };

    case 'REMOVE_SHAPE':
      return {
        ...state,
        shapes: state.shapes.filter((s) => s.id !== action.payload),
      };

    case 'ADD_TEXT':
      return { ...state, texts: [...state.texts, action.payload] };

    case 'UPDATE_TEXT':
      return {
        ...state,
        texts: state.texts.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      };

    case 'REMOVE_TEXT':
      return {
        ...state,
        texts: state.texts.filter((t) => t.id !== action.payload),
      };

    case 'UPDATE_CANVAS':
      return {
        ...state,
        canvas: { ...state.canvas, ...action.payload },
      };

    default:
      return state;
  }
}

// Provider component
export function TopologyProvider({ children }: { children: ReactNode }) {
  const [topology, dispatch] = useReducer(topologyReducer, initialTopology);
  const [selection, setSelectionState] = React.useState<Selection>(initialSelection);
  const [editorState, setEditorStateInternal] = React.useState<EditorState>(initialEditorState);
  const [viewport, setViewportInternal] = React.useState<ViewportState>(initialViewport);

  // Save to localStorage on changes
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem('topology-autosave', JSON.stringify(topology));
      } catch (error) {
        console.error('Failed to save topology:', error);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [topology]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('topology-autosave');
      if (saved) {
        const loadedTopology = JSON.parse(saved);
        // Ensure built-in assets are always included
        loadedTopology.assets = [
          ...builtInAssets,
          ...(loadedTopology.assets || []).filter((a: any) => a.type !== 'builtin'),
        ];
        dispatch({ type: 'SET_TOPOLOGY', payload: loadedTopology });
      }
    } catch (error) {
      console.error('Failed to load topology:', error);
      // Clear corrupted data
      localStorage.removeItem('topology-autosave');
    }
  }, []);

  const setSelection = React.useCallback((newSelection: Selection) => {
    setSelectionState(newSelection);
  }, []);

  const setEditorState = React.useCallback((updates: Partial<EditorState>) => {
    setEditorStateInternal((prev) => ({ ...prev, ...updates }));
  }, []);

  const setViewport = React.useCallback((updates: Partial<ViewportState>) => {
    setViewportInternal((prev) => ({ ...prev, ...updates }));
  }, []);

  const value: TopologyContextState = {
    topology,
    selection,
    editorState,
    viewport,
    dispatch,
    setSelection,
    setEditorState,
    setViewport,
  };

  return <TopologyContext.Provider value={value}>{children}</TopologyContext.Provider>;
}

// Hook to use the context
export function useTopology() {
  const context = useContext(TopologyContext);
  if (!context) {
    throw new Error('useTopology must be used within TopologyProvider');
  }
  return context;
}
