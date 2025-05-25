const Filter = ({searchName, handleSearchName}) => {
  return(
    <form onSubmit={(e) => e.preventDefault()}>
        <div>
          filter shown with <input value={searchName} onChange={handleSearchName} />
        </div>
    </form>
  )
}

export default Filter