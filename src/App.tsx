import './App.css'
import AppProvider from './Context/AppProvider'
import ScrollToTop from './ScrollToTop'
import { Route, Routes } from 'react-router-dom'
import HomePage from './HomePage/HomePage'
import NavBar from './Navbar/NavBar'
import Footer from './Footer/Footer'
import CataloyPage from './CatalogyPage/CatalogyPage'

function App() {


  return (
    <>

      <AppProvider>
        <NavBar/>
        <ScrollToTop />
        <Routes>
     
          <Route path='/' element = {<HomePage/>}/>

          <Route path='/movies' element ={<CataloyPage/>} />

        </Routes>
        <Footer/>
      </AppProvider>
      
      
    </>
  )
}

export default App
