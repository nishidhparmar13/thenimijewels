import React from 'react'
import Header from './components/Header/Header'
import Loader from './components/Loaders/Loader'
import HeroCarousel from './components/Hero/HeroCarousel'
import CategoriesView from './components/Categories/CategoriesView'

const Home = () => {
  return (
    <div>
      {/* <Loader /> */}
      <Header />
      <HeroCarousel />
      <CategoriesView />
    </div>
  )
}

export default Home