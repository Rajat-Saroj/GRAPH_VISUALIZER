import React from 'react';

function OutputPanel({ output }) {
  if (!output) {
    return (
      <div className="text-gray-500">
        Run the algorithm to see output.
      </div>
    );
  }
  
  if (output.loading) {
    return (
      <div className="text-primary-600">
        Running algorithm...
      </div>
    );
  }
  
  if (output.error) {
    return (
      <div className="text-red-500 font-bold">
        Error: {output.error}
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="text-primary-600 mb-4 text-lg font-semibold">
        Algorithm Output
      </h3>
      <pre className="bg-gray-100 p-4 rounded-lg text-base text-gray-800
                     max-h-72 overflow-y-auto font-mono leading-relaxed
                     text-xs sm:text-sm md:text-base
                     whitespace-pre-wrap break-words">
        {JSON.stringify(output, null, 2)}
      </pre>
    </div>
  );
}

export default OutputPanel;

















// import React from 'react';

// function OutputPanel({ output }) {
//   if (!output) return <div style={{ color: '#888' }}>Run the algorithm to see output.</div>;
//   if (output.loading) return <div style={{ color: '#2563eb' }}>Running algorithm...</div>;
//   if (output.error) return <div style={{ color: 'red', fontWeight: 'bold' }}>Error: {output.error}</div>;
  
//   return (
//     <div>
//       <h3 style={{ color: '#2563eb', marginBottom: '1rem' }}>Algorithm Output</h3>
//       <pre style={{
//         background: '#f3f4f6',
//         padding: '1rem',
//         borderRadius: '8px',
//         fontSize: '1rem',
//         color: '#222',
//         maxHeight: '300px',
//         overflowY: 'auto'
//       }}>
//         {JSON.stringify(output, null, 2)}
//       </pre>
//     </div>
//   );
// }

// export default OutputPanel;
