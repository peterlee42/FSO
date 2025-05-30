import { useState, useEffect} from 'react'
import axios from 'axios'

const Country = ({country}) => {
    const [currentWeather, setCurrentWeather] = useState(null)
    
    useEffect(() => {
        const api_key = import.meta.env.VITE_WEATHER_KEY
        const lat = country.capitalInfo.latlng[0], lon = country.capitalInfo.latlng[1]

        const units = 'metric'
        axios
            .get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${api_key}`)
            .then(response => {
                const apiResponse = response.data
                setCurrentWeather(apiResponse)
                console.log(apiResponse)
            })
            .catch(error =>
                console.log(error)
            )
    }, [])

    if (currentWeather){
        const iconId = currentWeather.weather[0].icon
        const weatherIcon = `https://openweathermap.org/img/wn/${iconId}@2x.png`
        
        return(
            <div>
                <h2>{country.name.common}</h2>
                <div>Capital: {country.capital}</div>
                <div>Area: {country.area}</div>
                <h3>Languages</h3>
                <ul>
                    {Object.entries(country.languages).map(([code, language]) => <li key={code}>{language}</li>)}
                </ul>
                <img src={country.flags.png} alt={`The flag of ${country.name.common}`}/>
                <h3>Weather in {country.name.common}</h3>
                <div>Temperature: {currentWeather.main.temp}°C</div>
                <img src={weatherIcon} alt='Weather Icon' />
                <div>Wind: {currentWeather.wind.speed} m/s</div>
            </div>
        )
    }

    return (
        <div>
            <h2>{country.name.common}</h2>
            <div>Capital: {country.capital}</div>
            <div>Area: {country.area}</div>
            <h3>Languages</h3>
            <ul>
                {Object.entries(country.languages).map(([code, language]) => <li key={code}>{language}</li>)}
            </ul>
            <img src={country.flags.png} alt={`The flag of ${country.name.common}`}/>
            <h3>Weather in {country.name.common}</h3>
        </div>
    )
}

export default Country