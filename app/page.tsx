import React from 'react'
import Header from './components/Header/Header'
import Loader from './components/Loaders/Loader'

const Home = () => {
  return (
    <div>
      <Loader />
      <Header />
    </div>
  )
}

export default Home