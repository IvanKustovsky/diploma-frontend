import React from "react";
import "../../assets/HomePage.css";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";

function HomePage() {
    return (
        <div className="home-page">
            <Header />
            <main className="main-content">
                <section className="hero-section">
                    <h2>Welcome to Our Platform</h2>
                    <p>Your one-stop solution for renting energy equipment.</p>
                    <button className="cta-button">Get Started</button>
                </section>
                <section className="features-section">
                    <h2>Features</h2>
                    <div className="feature">
                        <h3>Easy Renting</h3>
                        <p>Quickly find and rent the equipment you need.</p>
                    </div>
                    <div className="feature">
                        <h3>Reliable Service</h3>
                        <p>Top-notch equipment and support.</p>
                    </div>
                    <div className="feature">
                        <h3>Flexible Terms</h3>
                        <p>Choose rental terms that suit your needs.</p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default HomePage;