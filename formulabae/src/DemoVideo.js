import React from 'react';

function DemoVideo() {
  return (
    <div style={{ maxWidth: '640px', margin: '2rem auto', textAlign: 'center' }}>
      <h2 style={{ color: '#6b21a8', marginBottom: '1rem' }}>🎥 How to Use FormulaBae</h2>
      <iframe
        width="100%"
        height="360"
        src="https://www.youtube.com/embed/ICBulE6ezuw"
        title="FormulaBae Demo"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ borderRadius: '12px', boxShadow: '0 6px 12px rgba(107,33,168,0.3)' }}
      />
      <p style={{ color: '#6b21a8', marginTop: '1rem', fontWeight: 'bold' }}>
        Watch how FormulaBae makes science easier and faster!
      </p>
    </div>
  );
}

export default DemoVideo;
