import { useState } from 'react';
import Navbar from './Navbar';
import './Contact.css';
import { Mail, MapPin, Phone, Send, CheckCircle, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: ''
      });
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 800);
  };

  return (
    <div className="contact-page">
      <Navbar />
      
      <div className="contact-page-container">
        <div className="contact-card">
          {/* Left Side - Info */}
          <div className="contact-info-section">
            <div className="contact-info-header">
              <h2>Get in Touch</h2>
              <p>We'd love to hear from you. Our friendly team is always here to chat and provide support for your premium B2B experience.</p>
            </div>
            
            <div className="contact-details">
              <div className="contact-detail-item">
                <div className="contact-icon-wrapper">
                  <Phone size={24} color="white" />
                </div>
                <div className="contact-detail-text">
                  <h4>Phone Support</h4>
                  <p>+91 96626-86196</p>
                  <p>Mon - Fri, 9am - 6pm</p>
                </div>
              </div>
              
              <div className="contact-detail-item">
                <div className="contact-icon-wrapper">
                  <Mail size={24} color="white" />
                </div>
                <div className="contact-detail-text">
                  <h4>Email Us</h4>
                  <p>support@sovely.com</p>
                  <p>sales@sovely.com</p>
                </div>
              </div>
              
              <div className="contact-detail-item">
                <div className="contact-icon-wrapper">
                  <MapPin size={24} color="white" />
                </div>
                <div className="contact-detail-text">
                  <h4>Office Location</h4>
                  <p>Sovely Headquarters</p>
                  <p>123 Business Avenue, Suite #400</p>
                  <p>Tech District, IN 380001</p>
                </div>
              </div>
            </div>
            
            <div className="contact-social-links">
              <a href="#" className="social-circle" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="social-circle" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="social-circle" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="social-circle" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Right Side - Form */}
          <div className="contact-form-section">
            {isSubmitted ? (
              <div className="success-message">
                <CheckCircle size={32} color="#10b981" />
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#064e3b', marginBottom: '4px' }}>Message Sent!</h4>
                  <p style={{ fontSize: '15px', color: '#065f46', margin: 0 }}>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                </div>
              </div>
            ) : null}
            
            <h3>Send us a Message</h3>
            <p>Fill out the form below and we'll reply as soon as possible.</p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    name="firstName" 
                    className="form-control" 
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    name="lastName" 
                    className="form-control" 
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    className="form-control" 
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number (Optional)</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    className="form-control" 
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="form-group" style={{ marginBottom: '25px' }}>
                <label htmlFor="message">Your Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  className="form-control" 
                  placeholder="How can we help you today? Please provide as much detail as possible."
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              
              <button type="submit" className="submit-btn">
                Send Message <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
