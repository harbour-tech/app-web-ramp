import { Snap } from '@/types';
import {
  createContext,
  Dispatch,
  ReactNode,
  Reducer,
  useEffect,
  useReducer,
} from 'react';

import { detectSnaps, getSnap, isFlask } from '../../utils';

export type MetamaskState = {
  snapsDetected: boolean;
  isFlask: boolean;
  installedSnap?: Snap | Promise<boolean>;
  error?: Error;
};

const initialState: MetamaskState = {
  snapsDetected: false,
  isFlask: false,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MetamaskDispatch = { type: MetamaskActions; payload: any };

export const MetaMaskContext = createContext<
  [MetamaskState, Dispatch<MetamaskDispatch>]
>([
  initialState,
  () => {
    /* no op */
  },
]);

export enum MetamaskActions {
  SetInstalled = 'SetInstalled',
  SetSnapsDetected = 'SetSnapsDetected',
  SetError = 'SetError',
  SetIsFlask = 'SetIsFlask',
}

const reducer: Reducer<MetamaskState, MetamaskDispatch> = (state, action) => {
  switch (action.type) {
    case MetamaskActions.SetInstalled:
      return {
        ...state,
        installedSnap: action.payload,
      };

    case MetamaskActions.SetSnapsDetected:
      return {
        ...state,
        snapsDetected: action.payload,
      };
    case MetamaskActions.SetIsFlask:
      return {
        ...state,
        isFlask: action.payload,
      };
    case MetamaskActions.SetError:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

/**
 * MetaMask context provider to handle MetaMask and snap status.
 *
 * @param props - React Props.
 * @param props.children - React component to be wrapped by the Provider.
 * @returns JSX.
 */
export const MetaMaskContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Find MetaMask Provider and search for Snaps
  // Also checks if MetaMask version is Flask
  useEffect(() => {
    const setSnapsCompatibility = async () => {
      dispatch({
        type: MetamaskActions.SetSnapsDetected,
        payload: await detectSnaps(),
      });
    };

    setSnapsCompatibility().catch(console.error);
  }, [window.ethereum]);

  // Set installed snaps
  useEffect(() => {
    /**
     * Detect if a snap is installed and set it in the state.
     */
    async function detectSnapInstalled() {
      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: await getSnap(),
      });
    }

    const checkIfFlask = async () => {
      dispatch({
        type: MetamaskActions.SetIsFlask,
        payload: await isFlask(),
      });
    };

    if (state.snapsDetected) {
      detectSnapInstalled().catch(console.error);
      checkIfFlask().catch(console.error);
    }
  }, [state.snapsDetected]);

  useEffect(() => {
    let timeoutId: number;

    if (state.error) {
      timeoutId = window.setTimeout(() => {
        dispatch({
          type: MetamaskActions.SetError,
          payload: undefined,
        });
      }, 10000);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [state.error]);

  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  return (
    <MetaMaskContext.Provider value={[state, dispatch]}>
      {children}
    </MetaMaskContext.Provider>
  );
};
