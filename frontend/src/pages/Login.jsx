import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import './Login.css';

/* ===== ReactBits-Inspired: Floating Particles ===== */
function FloatingParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create leaf-like particles
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.3 + 0.1,
        hue: 120 + Math.random() * 40,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 60%, 40%, ${p.opacity})`;
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y > canvas.height + 10) { p.y = -10; p.x = Math.random() * canvas.width; }
        if (p.x > canvas.width + 10 || p.x < -10) p.speedX *= -1;
      }

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(27, 94, 32, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="login-particles" />;
}

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!mobile || !password) {
      setError('Please enter both mobile number and password.');
      return;
    }

    if (mobile.length !== 10) {
      setError('Mobile number must be 10 digits.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login(mobile, password);
      const { token, role, mobile: userMobile } = res.data;
      login(token, { role, mobile: userMobile });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-v2">
      <FloatingParticles />
      
      {/* Decorative floating shapes */}
      <div className="login-bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
        <div className="shape shape-4" />
        <div className="shape shape-5" />
      </div>

      <div className="login-container">
        {/* Left Panel - Branding */}
        <div className="login-hero">
          <div className="hero-content">
            <div className="hero-icon-group">
              <div className="hero-icon main">
                <span className="material-symbols-outlined">child_care</span>
              </div>
              <div className="hero-icon sub sub-1">
                <span className="material-symbols-outlined">vaccines</span>
              </div>
              <div className="hero-icon sub sub-2">
                <span className="material-symbols-outlined">monitoring</span>
              </div>
              <div className="hero-icon sub sub-3">
                <span className="material-symbols-outlined">restaurant</span>
              </div>
            </div>
            <h1 className="hero-title">
              <span className="hero-title-line">Anganwadi</span>
              <span className="hero-title-line accent">Management System</span>
            </h1>
            <p className="hero-desc">
              Integrated Child Development Services — Empowering communities through nutrition tracking, growth monitoring, and vaccination management.
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="material-symbols-outlined">location_city</span>
                <div>
                  <strong>10+</strong>
                  <span>Centers</span>
                </div>
              </div>
              <div className="hero-stat">
                <span className="material-symbols-outlined">groups</span>
                <div>
                  <strong>500+</strong>
                  <span>Beneficiaries</span>
                </div>
              </div>
              <div className="hero-stat">
                <span className="material-symbols-outlined">verified</span>
                <div>
                  <strong>99.9%</strong>
                  <span>Uptime</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-footer">
            <span>Ministry of Women & Child Development</span>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="login-form-panel">
          <div className="login-form-inner">
            <div className="login-form-header">
              <div className="login-mobile-brand">
                <div className="login-brand-icon-v2">
                  <span className="material-symbols-outlined">eco</span>
                </div>
                <span>ICDS Tracker</span>
              </div>
              <h2>Welcome back</h2>
              <p>Sign in to your account to continue</p>
            </div>

            <form className="login-form-v2" onSubmit={handleSubmit}>
              {error && (
                <div className="login-error-v2">
                  <span className="material-symbols-outlined">error</span>
                  <span>{error}</span>
                </div>
              )}

              <div className={`login-field ${focusField === 'mobile' ? 'focused' : ''} ${mobile ? 'has-value' : ''}`}>
                <label htmlFor="login-mobile">Mobile Number</label>
                <div className="login-field-inner">
                  <span className="material-symbols-outlined field-icon">phone_android</span>
                  <input
                    id="login-mobile"
                    type="tel"
                    placeholder="Enter 10-digit mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    autoComplete="username"
                    onFocus={() => setFocusField('mobile')}
                    onBlur={() => setFocusField('')}
                  />
                  {mobile.length === 10 && (
                    <span className="material-symbols-outlined field-check">check_circle</span>
                  )}
                </div>
              </div>

              <div className={`login-field ${focusField === 'password' ? 'focused' : ''} ${password ? 'has-value' : ''}`}>
                <label htmlFor="login-password">Password</label>
                <div className="login-field-inner">
                  <span className="material-symbols-outlined field-icon">lock</span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    onFocus={() => setFocusField('password')}
                    onBlur={() => setFocusField('')}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                className={`login-btn-v2 ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="btn-spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-footer-v2">
              <div className="login-secure">
                <span className="material-symbols-outlined">shield</span>
                <span>Secured with end-to-end encryption</span>
              </div>
              <div className="login-version">
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
