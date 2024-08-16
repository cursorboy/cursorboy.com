import React, { useState, useRef } from "react";
import { FaCheck } from "react-icons/fa";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const formRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; 

    setIsSubmitting(true); 

    emailjs.sendForm('service_vqftcs5', 'template_j4tj89e', formRef.current, 'w4zUhdV5usG1yNP5K')
      .then((response) => {
        console.log("Email sent successfully!", response.status, response.text);
        setSubmitted(true);
        setIsSubmitting(false); 
      }, (error) => {
        console.error("Failed to send email.", error);
        setIsSubmitting(false); 
      });
  };

  return (
    <div className="contact-container">
      <h2>Contact Me</h2>
      {submitted ? (
        <p className="submitted-message">Thank you! Your message has been sent.</p>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
            <FaCheck />
          </button>
        </form>
      )}
    </div>
  );
};

export default Contact;
