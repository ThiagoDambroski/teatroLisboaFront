import CategorysDisplay from "../Category/CategorysDisplay"
import HomeFQA from "./HomeFQA"
import HomeIntro from "./HomeIntro"
import HomePrices from "./HomePrices"
import HomeTrailerDisplay from "./HomeTrailerDisplay"


function HomePage() {
  return (
    <main>
        <HomeIntro/>
        <CategorysDisplay/>
        <HomeFQA/>
        <HomePrices/>
        <HomeTrailerDisplay/>
    </main>
  )
}

export default HomePage