import React from 'react'

const TailwindTest = () => {
  return (
    <div style={{backgroundColor: 'red', minHeight: '100vh', color: 'white', padding: '20px'}}>
      <h1 style={{fontSize: '48px', fontWeight: 'bold'}}>INLINE STYLES WORK</h1>
      
      <div className="bg-blue-500 text-white p-8 m-4 rounded-lg">
        <h2 className="text-4xl font-bold">TAILWIND TEST</h2>
        <p className="text-xl">If this is blue with white text, Tailwind is working!</p>
      </div>
      
      <div className="bg-green-600 p-4 rounded">
        <p className="text-white">This should be green</p>
      </div>
      
      <style>
        {`
          .custom-test {
            background-color: yellow;
            color: black;
            padding: 20px;
            margin: 10px;
          }
        `}
      </style>
      
      <div className="custom-test">
        This uses inline CSS in a style tag - should be yellow
      </div>
    </div>
  )
}

export default TailwindTest
