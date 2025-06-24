import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import backgroundImage from './assets/bg-formulabae.png';
import screenshot1 from './assets/screenshot1.png';
import screenshot2 from './assets/screenshot2.png';
import screenshot3 from './assets/screenshot3.png';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';
import DemoVideo from './DemoVideo';
import 'react-image-lightbox/style.css';
import Lightbox from 'react-image-lightbox';

function HomePage() {
  const images = [screenshot1, screenshot2, screenshot3];
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});

  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setLoadedImages((prev) => ({ ...prev, [src]: true }));
      };
    });
  }, [images]);

  const handleImageClick = (index) => {
    const src = images[index];
    if (loadedImages[src]) {
      setPhotoIndex(index);
      setIsOpen(true);
    } else {
      alert('Image is still loading, please wait a moment.');
    }
  };

  return (
    <div style={{ ...styles.container, backgroundImage: `url(${backgroundImage})` }}>
      <div style={styles.contentWrapper}>
        <div style={styles.centeredBoldText}>
          <p style={styles.logoText}>🧬 FormulaBae</p>
          <p>Science that sticks. Tools that click.</p>
          <p>🧪 FormulaBae is your science sidekick. We turn formulas into tools that work — fast, cute, and student-friendly.</p>
        </div>

        <div style={styles.box}>
          <p>👩🏽‍🔬 Select a tool to start solving.</p>
          <a
            href="https://lovable.dev/projects/fd247094-2fb2-4ca4-a493-e98c0459eb7d"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            🚀 Launch the Lovable App
          </a>
        </div>

        <DemoVideo />

        <h2 style={styles.galleryHeading}>✨ Preview the Magic</h2>
        <div style={styles.screenshotGallery}>
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`App screenshot ${index + 1}`}
              style={{
                ...styles.screenshot,
                cursor: loadedImages[img] ? 'pointer' : 'not-allowed',
                opacity: loadedImages[img] ? 1 : 0.5,
              }}
              onClick={() => handleImageClick(index)}
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>

        {isOpen && (
          <Lightbox
            mainSrc={images[photoIndex]}
            nextSrc={images[(photoIndex + 1) % images.length]}
            prevSrc={images[(photoIndex + images.length - 1) % images.length]}
            onCloseRequest={() => setIsOpen(false)}
            onMovePrevRequest={() =>
              setPhotoIndex((photoIndex + images.length - 1) % images.length)
            }
            onMoveNextRequest={() =>
              setPhotoIndex((photoIndex + 1) % images.length)
            }
            animationDuration={300}
          />
        )}
      </div>

      <footer style={styles.footer}>
        <Link to="/about" style={styles.footerLink} className="footer-link">📖 About</Link>
        <Link to="/contact" style={styles.footerLink} className="footer-link">✉️ Contact</Link>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </Router>
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
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  contentWrapper: {
    flex: '1 0 auto',
  },
  centeredBoldText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#6b21a8',
    maxWidth: '600px',
    margin: '0 auto 2rem',
    lineHeight: '1.5',
    fontSize: '1.2rem',
  },
  logoText: {
    fontSize: '2.5rem',
    marginBottom: '0.25rem',
  },
  box: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '1.5rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
    margin: '0 auto 2rem',
    maxWidth: '400px',
    width: '100%',
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
  galleryHeading: {
    fontSize: '1.5rem',
    color: '#6b21a8',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  screenshotGallery: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  },
  screenshot: {
    width: '280px',
    borderRadius: '1rem',
    boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
    transition: 'opacity 0.3s',
  },
  footer: {
    flexShrink: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    position: 'fixed',
    bottom: 0,
    width: '100%',
    boxShadow: '0 -2px 6px rgba(0,0,0,0.1)',
    borderTopLeftRadius: '1rem',
    borderTopRightRadius: '1rem',
    zIndex: 100,
  },
  footerLink: {
    color: '#6b21a8',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
};

export default App;









