import { useState, useEffect } from 'react'

import axios from 'axios'

import Search from './components/Search'
import Content from './components/Content'

function App() {
  const [allCountries, setAllCountries] = useState([])
  const [filterCountries, setFilterCountries]= useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then((response) => {
        setAllCountries(response.data)
      }).catch((error) => {
        console.error('Error fetching countries:', error)
      })
  }, [])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    if (search){
      const regex = new RegExp(search, 'i')
      setFilterCountries(() => allCountries.filter(country => country.name.common.match(regex)))
    }
  }

  return (
    <div>
      <h1>Country Information</h1>
      <Search search={search} handleSearch={handleSearch} />
      <Content search={search} filterCountries={filterCountries} setFilterCountries={setFilterCountries} />
    </div>
  )
}
export default App
