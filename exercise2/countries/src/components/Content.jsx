import Country from './Country'

const Content = ({ search, filterCountries, setFilterCountries }) => {
  if (!search) {
    return <div>Search for a country!</div>
  }

  else if (filterCountries.length > 10) {
    return <div>Too many matches, specify another filter</div>
  }

  else if (filterCountries.length > 1) {
    return (
      <ul>
        {filterCountries.map((country, i) => (
          <li key={i}>{country.name.common} <button onClick={() => setFilterCountries([country])}>Show</button></li>
        ))}
      </ul>
    )
  }

  else if (filterCountries.length === 1) {
    return (
      <Country country={filterCountries[0]} />
    )
  }

  else{
    return <div>No matches, specify another filter</div>
  }

}

export default Content
