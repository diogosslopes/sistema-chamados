import index from '../index.css'


export default function Title({ children, name }) {

    return (
        <div className='title' >
            {children}
            <h1> {name} </h1>
        </div>
    )
}