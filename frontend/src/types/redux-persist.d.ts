declare module 'redux-persist/integration/react' {
  import type { Component, ReactNode } from 'react';
  import type { Persistor } from 'redux-persist';

  export type PersistGateProps = {
    children?: ReactNode | ((bootstrapped: boolean) => ReactNode);
    loading?: ReactNode;
    persistor: Persistor;
    onBeforeLift?: () => void | Promise<void>;
  };

  export class PersistGate extends Component<PersistGateProps> {}
}
