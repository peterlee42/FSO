const Total = ({ parts }) => {
    const totalExercises = parts.reduce((sum, part) => sum + part.exercises, 0)

    return (
        <div>total of {totalExercises} exercises</div>
    )
}

export default Total