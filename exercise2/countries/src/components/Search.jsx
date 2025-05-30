const Search = ( {search, handleSearch} ) => {
    return (
        <form onSubmit={e => e.preventDefault()}>
            <div>
                find countries <input value={search} onChange={handleSearch} />
            </div>
        </form>
    )
}

export default Search