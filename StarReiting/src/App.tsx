import LogoIcon from './assets/stair.svg?react'
import './styles.css'
import './components/RestCard/RestCard.css'
import { Search } from './components/Search/Search'

function App() {
  return (
    <>
      <header>
        <div className="logo">
          <LogoIcon width={16} height={16} className="logo__icon" />
          <span>Eats</span>
        </div>
        <div className="profile">
          <img alt="profile" src="/avatar.png" />
        </div>
      </header>
      <main className="container">
        <section>
          <Search />
        </section>
      </main>
      <footer>
        <p>Privacy Policy</p>
        <p className="corporation">2022 Eats</p>
        <p>Terms Of Service</p>
      </footer>
    </>

  )
}




export default App