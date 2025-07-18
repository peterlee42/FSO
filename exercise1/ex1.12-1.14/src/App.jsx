import { useState } from 'react'

const Header = (props) => {
  return (
    <h2>{props.title}</h2>
  )
}

const Button = (props) => {
  return (
      <button onClick={props.onClick}>
        {props.text}
      </button>
  )
}

const DisplayVotes = ({voteCount}) => {
  return (
    <div>has {voteCount} votes</div>
  )
}

const App = () => {
  const anecdotes = [
    'If it hurts, do it more often.',
    'Adding manpower to a late software project makes it later!',
    'The first 90 percent of the code accounts for the first 90 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.',
    'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    'Premature optimization is the root of all evil.',
    'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.',
    'Programming without an extremely heavy use of console.log is same as if a doctor would refuse to use x-rays or blood tests when diagnosing patients.',
    'The only way to go fast, is to go well.'
  ]
   
  const [selected, setSelected] = useState(0)

  const [votes, setVotes] = useState(Array(anecdotes.length).fill(0))

  const [mostVotesIndex, setMostVotesIndex] = useState(0)

  const getRandomIndex = () =>  Math.floor(Math.random() * anecdotes.length)

  const setToVotes = () => {
    const votesCopy = [... votes]
    votesCopy[selected] += 1

    setVotes(votesCopy)

    if (votesCopy[mostVotesIndex] < votesCopy[selected]) {
      setMostVotesIndex(selected)
    }
  }

  return (
    <div>
      <Header title="Anecdote of the day" />
      {anecdotes[selected]}
      <DisplayVotes voteCount={votes[selected]} />
      <div>
        <Button onClick={() => setToVotes(selected)} text="vote" />
        <Button onClick={() => setSelected(getRandomIndex())} text="next anecdote" />
      </div>
      <Header title="Anecdote with most votes" />
      {anecdotes[mostVotesIndex]}
      <DisplayVotes voteCount={votes[mostVotesIndex]} />

    </div>
  )
}

export default App