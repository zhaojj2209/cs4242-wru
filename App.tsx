import * as React from 'react'
import { Provider as PaperProvider } from 'react-native-paper'
import Main from './src/main/Main'

const App = () => {
  return (
    <PaperProvider>
      <Main />
    </PaperProvider>
  )
}

export default App
