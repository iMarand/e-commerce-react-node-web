import { useState } from 'react';

import { Routes, Route, Link } from 'react-router-dom';
import Header from "Header.jsx";
import './App.css';

function App() {
    const [count, setCount] = useState(0)

    return (
        <>
            <nav>
                <Link to="/">Home Page</Link>
                {/* <Link to="/">Home Page</Link> */}
            </nav>

            <Routes>
                <Route path="/" element={}></Route>
            </Routes>
        </>
    )
}

export default App
