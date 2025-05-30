import Header from './Header.jsx'
import Content from './Content.jsx'
import Total from './Total.jsx'

const Courses = ({ courses }) => {
    return (
        <div>
            {
                courses.map(course => {
                    return(
                        <div key={course.id}>
                            <Header course={course.name} />
                            <Content parts={course.parts}/>
                            <Total parts={course.parts}/>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default Courses