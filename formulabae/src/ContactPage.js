import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from './assets/bg-formulabae.png';

function ContactPage() {
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/xvgrwjwr", {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
        },
      });
      if (response.ok) {
        setStatus("Thanks for your message!");
        form.reset();
      } else {
        setStatus("Oops! There was a problem.");
      }
    } catch {
      setStatus("Oops! There was a problem.");
    }
  };

  return (
    <div style={{ ...styles.container, backgroundImage: `url(${backgroundImage})` }}>
      <div style={styles.contentWrapper}>
        <h1 style={styles.title}>✉️ Contact Us</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Your name"
            style={styles.input}
          />

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="Your email"
            style={styles.input}
          />

          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            name="message"
            required
            rows="5"
            placeholder="Your message"
            style={styles.textarea}
          />

          <button type="submit" className="glow-button" style={styles.submitButton}>
            Send
          </button>
        </form>
        {status && <p>{status}</p>}

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
    width: '90%',
    maxWidth: '900px',
    textAlign: 'center',
    boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '1rem',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1rem',
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #ccc',
  },
  textarea: {
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #ccc',
  },
  submitButton: {
    backgroundColor: '#6b21a8',
    color: '#fff',
    padding: '0.75rem',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
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

export default ContactPage;
