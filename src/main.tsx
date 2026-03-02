// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  //   <App />      // StrictMode pode causar problemas com certos hooks e efeitos colaterais, especialmente em desenvolvimento. Se você estiver enfrentando problemas, pode ser útil remover o StrictMode temporariamente para identificar a causa. Certifique-se de testar completamente seu aplicativo após fazer essa alteração, pois o StrictMode ajuda a identificar problemas potenciais no código.
  // </StrictMode>,
  <App />
)
