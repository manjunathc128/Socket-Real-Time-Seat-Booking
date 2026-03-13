import { MantineProvider, Box, Paper, colorsTuple } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store'
import { BrowserRouter } from 'react-router-dom';
import { Center } from '@mantine/core';
import { SocketProvider } from '@/context/SocketContext'; 
import AppRoutes from '@/routes/AppRoutes';
import "@mantine/core/styles.css"
import '@mantine/notifications/styles.css'
import React from 'react';

// const AppContent = (): React.ReactNode => {
//   const isRehydrated = useSelector((state: RootState) => state._persist?.rehydrated)
//   if (!isRehydrated){ return (
//       <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
//                 Loading... (Manual check)
//       </div>
//   )
//   }else{
//     return <p></p>
//   }
// }

function App(): React.ReactNode {



    return (
        <Provider store={store}>
          <PersistGate loading={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Loading... (Rehydrating Redux State)</div>  } persistor={persistor} >
          <BrowserRouter>
            <MantineProvider>
              <Notifications position='top-right' />
              <SocketProvider>
                {/* <AppContent /> */}
                <ModalsProvider>
                  
                    <AppRoutes />
                  
                </ModalsProvider>
              </SocketProvider>  
            </MantineProvider>
          </BrowserRouter>  
          </PersistGate>
        </Provider>

    )
}

export default App
