import React from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from './assets/bg-formulabae.png';

function AboutPage() {
  return (
    <div style={{ ...styles.container, backgroundImage: `url(${backgroundImage})` }}>
      <div style={styles.contentWrapper}>
        <h1 style={styles.title}>📖 About FormulaBae</h1>
        <p style={styles.text}>
          FormulaBae is your go-to science sidekick that turns complex formulas into easy-to-use, fast, and student-friendly tools.
          We're passionate about making science stick and tools that click.
        </p>
        <p style={styles.text}>
          Whether you're a student or a science enthusiast, FormulaBae is designed to make your learning journey smoother and more fun.
        </p>
        <Link to="/" style={styles.backButton} className="glow-button">
          🏠 Back to Home
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '2rem',
    fontFamily: 'Poppins, sans-serif',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    color: '#6b21a8',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: '2rem',
    borderRadius: '1rem',
    maxWidth: '600px',
    textAlign: 'center',
    boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '1rem',
    fontWeight: 'bold',
  },
  text: {
    fontSize: '1.1rem',
    marginBottom: '1rem',
    lineHeight: '1.6',
  },
  backButton: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#6b21a8',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '0.5rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

export default AboutPage;


