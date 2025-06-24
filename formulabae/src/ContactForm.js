import React, { useState } from 'react';

function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const data = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
    };

    const response = await fetch('https://formspree.io/f/xldnpkrn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      setSubmitted(true);
      form.reset();
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>💬 Contact FormulaBae</h2>
      {submitted ? (
        <p style={styles.success}>Thanks Bestie! We'll get back to you soon. 🧪</p>
      ) : (
        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="text" name="name" placeholder="Your Name" required style={styles.input} />
          <input type="email" name="email" placeholder="Your Email" required style={styles.input} />
          <textarea name="message" placeholder="Your Message" required style={styles.textarea}></textarea>
          <button type="submit" style={styles.button}>Send</button>
        </form>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#f3e8ff',
    padding: '2rem',
    borderRadius: '1rem',
    marginTop: '2rem',
  },
  heading: {
    fontSize: '1.5rem',
    color: '#6b21a8',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '0.75rem',
    marginBottom: '1rem',
    border: '1px solid #ccc',
    borderRadius: '0.5rem',
    fontSize: '1rem',
  },
  textarea: {
    padding: '0.75rem',
    minHeight: '100px',
    marginBottom: '1rem',
    border: '1px solid #ccc',
    borderRadius: '0.5rem',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#6b21a8',
    color: '#fff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  success: {
    color: '#10b981',
    fontSize: '1.1rem',
  },
};

export default ContactForm;
