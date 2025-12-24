import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

const Home = () => {
    const navigate = useNavigate()

    const handlePanelLogin = (role) => {
        navigate('/login', { state: { role } })
    }

    const features = [
        {
            icon: '📝',
            title: 'Easy Complaint Filing',
            description: 'Citizens can quickly file complaints with photo evidence and track their status in real-time.'
        },
        {
            icon: '👮',
            title: 'Officer Management',
            description: 'Dedicated dashboard for officers to manage and resolve complaints efficiently.'
        },
        {
            icon: '⚡',
            title: 'Real-time Updates',
            description: 'Get instant notifications on complaint status changes and resolutions.'
        },
        {
            icon: '🔒',
            title: 'Secure & Private',
            description: 'Your data is protected with industry-standard security measures and encryption.'
        },
        {
            icon: '📊',
            title: 'Analytics Dashboard',
            description: 'Comprehensive insights and statistics for administrators to track performance.'
        },
        {
            icon: '🌐',
            title: 'Accessible Anywhere',
            description: 'Fully responsive design works seamlessly on desktop, tablet, and mobile devices.'
        }
    ]

    const panels = [
        {
            role: 'ADMIN',
            title: 'Admin Panel',
            icon: '👑',
            description: 'Manage officers, approve registrations, and oversee all complaint operations.',
            color: 'admin',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            role: 'OFFICER',
            title: 'Officer Panel',
            icon: '👮',
            description: 'View assigned complaints, update status, and communicate with citizens.',
            color: 'officer',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
            role: 'CITIZEN',
            title: 'Citizen Panel',
            icon: '👤',
            description: 'File new complaints, track progress, and view resolution history.',
            color: 'citizen',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        }
    ]

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="badge-icon">🏛️</span>
                        <span>Civic Engagement Platform</span>
                    </div>
                    <h1 className="hero-title">
                        Welcome to <span className="gradient-text">CivicPulse</span>
                    </h1>
                    <p className="hero-subtitle">
                        Empowering communities through seamless complaint management and civic engagement.
                        Connect citizens with local authorities for faster resolutions.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn-primary" onClick={() => navigate('/signup')}>
                            Get Started
                        </button>
                        <button className="btn-secondary" onClick={() => {
                            document.getElementById('panels').scrollIntoView({ behavior: 'smooth' })
                        }}>
                            Explore Panels
                        </button>
                    </div>
                </div>
                <div className="hero-decoration">
                    <div className="floating-card card-1">
                        <span className="card-icon">📋</span>
                        <span className="card-text">Quick Filing</span>
                    </div>
                    <div className="floating-card card-2">
                        <span className="card-icon">✅</span>
                        <span className="card-text">Fast Resolution</span>
                    </div>
                    <div className="floating-card card-3">
                        <span className="card-icon">📊</span>
                        <span className="card-text">Track Progress</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <h2 className="section-title">Why Choose CivicPulse?</h2>
                    <p className="section-subtitle">
                        A comprehensive platform designed to bridge the gap between citizens and civic authorities
                    </p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Panels Section */}
            <section className="panels-section" id="panels">
                <div className="section-header">
                    <h2 className="section-title">Access Your Panel</h2>
                    <p className="section-subtitle">
                        Choose your role to login and access your personalized dashboard
                    </p>
                </div>
                <div className="panels-grid">
                    {panels.map((panel, index) => (
                        <div key={index} className={`panel-card panel-${panel.color}`}>
                            <div className="panel-icon-wrapper" style={{ background: panel.gradient }}>
                                <span className="panel-icon">{panel.icon}</span>
                            </div>
                            <h3 className="panel-title">{panel.title}</h3>
                            <p className="panel-description">{panel.description}</p>
                            <button
                                className="panel-login-btn"
                                onClick={() => handlePanelLogin(panel.role)}
                                style={{ background: panel.gradient }}
                            >
                                Login as {panel.role === 'ADMIN' ? 'Admin' : panel.role === 'OFFICER' ? 'Officer' : 'Citizen'}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* About Section */}
            <section className="about-section">
                <div className="about-content">
                    <div className="about-text">
                        <h2 className="about-title">About CivicPulse</h2>
                        <p className="about-description">
                            CivicPulse is a modern civic engagement platform that streamlines the complaint
                            management process between citizens and local authorities. Our mission is to create
                            transparent, efficient, and accountable governance through technology.
                        </p>
                        <div className="about-stats">
                            <div className="stat-item">
                                <div className="stat-number">Fast</div>
                                <div className="stat-label">Response Time</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">Secure</div>
                                <div className="stat-label">Data Protection</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">24/7</div>
                                <div className="stat-label">Availability</div>
                            </div>
                        </div>
                    </div>
                    <div className="about-image">
                        <div className="image-placeholder">
                            <span className="placeholder-icon">🏛️</span>
                            <p>Building Better Communities Together</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <h3>CivicPulse</h3>
                        <p>Empowering civic engagement</p>
                    </div>
                    <div className="footer-links">
                        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                            Back to Top
                        </a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 CivicPulse. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}

export default Home
