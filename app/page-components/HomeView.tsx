import React from 'react'
import HeroCarousel from '../components/heroes/HeroCarousel'
import MainCategories from './MainCategories.'
import AboutUs from './AboutUs'
import InstaReels from './InstaReels'

const HomeView = () => {
    return (
        <>
            <main>
                {/* Clears the fixed Header before the first banner. */}
                <div className="h-16 xs:h-[72px] sm:h-[82px]" />

                <HeroCarousel />
                <MainCategories />
                <InstaReels />
                <AboutUs />
            </main>
        </>
    )
}

export default HomeView
