import React from 'react';
import backgroundImage from './assets/bg-formulabae.png'; // adjust to .png if needed

function App() {
  return (
    <div style={{ ...styles.container, backgroundImage: `url(${backgroundImage})` }}>
      <h1 style={styles.logo}>🧬 FormulaBae</h1>
      <p style={styles.tagline}>Science that sticks. Tools that click.</p>

      <div style={styles.box}>
        <p>👩🏽‍🔬 Select a tool to start solving.</p>
        <a
          href="https://your-lovable-app-url.com"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.link}
        >
          🚀 Launch the Lovable App
        </a>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Poppins, sans-serif',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    color: '#2c2c2c',
    minHeight: '100vh',
  },
  logo: {
    fontSize: '2.5rem',
    color: '#6b21a8',
  },
  tagline: {
    fontSize: '1.2rem',
    marginBottom: '2rem',
    color: '#4b5563',
  },
  box: {
    backgroundColor: 'rgba(243, 232, 255, 0.85)',
    padding: '1.5rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  link: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#6b21a8',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '0.5rem',
    fontWeight: 'bold',
  },
};

export default App;