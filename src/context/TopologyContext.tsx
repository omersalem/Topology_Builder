import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type {
  Topology,
  TopologyAction,
  Selection,
  EditorState,
  ViewportState,
} from '../types/topology';
import { builtInAssets, DEFAULT_DEVICE_WIDTH, DEFAULT_DEVICE_HEIGHT } from '../assets/builtInAssets';

interface TopologyContextState {
  topology: Topology;
  selection: Selection;
  editorState: EditorState;
  viewport: ViewportState;
  dispatch: React.Dispatch<TopologyAction>;
  setSelection: (selection: Selection) => void;
  setEditorState: (state: Partial<EditorState>) => void;
  setViewport: (viewport: Partial<ViewportState>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
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
  lanes: [],
};

const initialSelection: Selection = {
  deviceIds: [],
  linkIds: [],
  groupIds: [],
  shapeIds: [],
  textIds: [],
  laneIds: [],
};

const initialEditorState: EditorState = {
  tool: 'select',
  isDrawing: false,
  isPanning: false,
  defaultDeviceSize: {
    width: DEFAULT_DEVICE_WIDTH,
    height: DEFAULT_DEVICE_HEIGHT,
  },
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

    // Lane actions
    case 'ADD_LANE':
      return { ...state, lanes: [...state.lanes, action.payload] };

    case 'UPDATE_LANE':
      return {
        ...state,
        lanes: state.lanes.map((l) =>
          l.id === action.payload.id ? { ...l, ...action.payload.updates } : l
        ),
      };

    case 'REMOVE_LANE':
      return {
        ...state,
        lanes: state.lanes.filter((l) => l.id !== action.payload),
      };

    default:
      return state;
  }
}

// Provider component
export function TopologyProvider({ children }: { children: ReactNode }) {
  // History-aware reducer
  const [historyDocs, dispatch] = useReducer(
    (state: { past: Topology[]; present: Topology; future: Topology[] }, action: TopologyAction) => {
      const { past, present, future } = state;

      if (action.type === 'UNDO') {
        if (past.length === 0) return state;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        return {
          past: newPast,
          present: previous,
          future: [present, ...future],
        };
      }

      if (action.type === 'REDO') {
        if (future.length === 0) return state;
        const next = future[0];
        const newFuture = future.slice(1);
        return {
          past: [...past, present],
          present: next,
          future: newFuture,
        };
      }

      // For all other actions, update topology and push to history
      // We limit history to 50 steps to prevent memory issues
      // Some actions (like SET_SELECTION or panning/zooming) shouldn't be undoable?
      // Actually ContextActions included SET_SELECTION, probably we don't want to undo selection changes efficiently?
      // But typically undo SHOULD undo selection? Maybe. The plan said "topology changes".
      // Let's filter out non-topology changes if possible, or just undo everything.
      // Usually users expect undo to undo data changes. Selection changes are transient.
      // However, the action types in `types/topology.ts` mix selection and data.
      // SET_SELECTION is separate.
      // Let's check action type.

      // UPDATE_CANVAS might be zoom/pan? No, Viewport is separate. Canvas config is data.

      const newPresent = topologyReducer(present, action);

      if (newPresent === present) return state; // No change

      if (action.type === 'SET_SELECTION') {
        // If purely selection change, just update present, don't push to history?
        // Or do we want to undo selection? 
        // Let's stick to simple: if it touches data, push history.
        // Selection is technically transient but often nice to undo.
        // For now, let's EXCLUDE selection from history to avoid spamming history with clicks.
        return {
          past,
          present: newPresent,
          future
        };
      }

      return {
        past: [...past, present].slice(-50),
        present: newPresent,
        future: [],
      };
    },
    {
      past: [],
      present: initialTopology,
      future: [],
    }
  );

  const { past, present: topology, future } = historyDocs;
  const [selection, setSelectionState] = React.useState<Selection>(initialSelection);
  const [editorState, setEditorStateInternal] = React.useState<EditorState>(initialEditorState);
  const [viewport, setViewportInternal] = React.useState<ViewportState>(initialViewport);

  // Save to localStorage
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

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('topology-autosave');
      if (saved) {
        const loadedTopology = JSON.parse(saved);
        loadedTopology.assets = [
          ...builtInAssets,
          ...(loadedTopology.assets || []).filter((a: any) => a.type !== 'builtin'),
        ];
        dispatch({ type: 'SET_TOPOLOGY', payload: loadedTopology });
      }
    } catch (error) {
      console.error('Failed to load topology:', error);
      localStorage.removeItem('topology-autosave');
    }
  }, []);

  const setSelection = React.useCallback((newSelection: Selection) => {
    setSelectionState(newSelection);
    // Also dispatch to keep topology in sync if needed (though selection is state)
    // Actually selection is dual-tracked? 
    // In legacy code: `case 'SET_SELECTION'` in reducer?
    // Checking reducer... YES, lines 199.
    // If we want consistency, we should dispatch SET_SELECTION too.
    dispatch({ type: 'SET_SELECTION', payload: newSelection });
  }, []);

  const setEditorState = React.useCallback((updates: Partial<EditorState>) => {
    setEditorStateInternal((prev) => ({ ...prev, ...updates }));
  }, []);

  const setViewport = React.useCallback((updates: Partial<ViewportState>) => {
    setViewportInternal((prev) => ({ ...prev, ...updates }));
  }, []);

  // Helper functions
  const undo = React.useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = React.useCallback(() => dispatch({ type: 'REDO' }), []);
  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const value: TopologyContextState & { undo: () => void; redo: () => void; canUndo: boolean; canRedo: boolean } = {
    topology,
    selection,
    editorState,
    viewport,
    dispatch,
    setSelection,
    setEditorState,
    setViewport,
    undo,
    redo,
    canUndo,
    canRedo,
  };

  return <TopologyContext.Provider value={value as any}>{children}</TopologyContext.Provider>;
}

// Hook to use the context
export function useTopology() {
  const context = useContext(TopologyContext);
  if (!context) {
    throw new Error('useTopology must be used within TopologyProvider');
  }
  return context;
}
