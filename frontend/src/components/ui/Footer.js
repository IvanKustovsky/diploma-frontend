import React from "react";
import "../../assets/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; 2024 Energy Equipment Rent Application. All rights reserved.</p>
        <nav className="footer-nav">
          <ul>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;